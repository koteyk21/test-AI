import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { UserWithStats, AuthContextType } from "@/types";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { loginSchema, registerSchema } from "@shared/schema";
import { useLocation } from "wouter";

export function useAuth(): AuthContextType {
  const [user, setUser] = useState<UserWithStats | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const { isLoading } = useQuery({
    queryKey: ['/api/users/me'],
    onSuccess: (data) => {
      setUser(data);
      setIsAuthenticated(true);
    },
    onError: () => {
      setUser(null);
      setIsAuthenticated(false);
    },
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const validatedData = loginSchema.parse(credentials);
      const res = await apiRequest('POST', '/api/auth/login', validatedData);
      return res.json();
    },
    onSuccess: (data) => {
      setUser(data.user);
      setIsAuthenticated(true);
      queryClient.invalidateQueries({ queryKey: ['/api/users/me'] });
      toast({
        title: "Login Successful",
        description: "Welcome back to SocialHub!",
      });
      navigate('/feed');
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: { username: string; password: string; name: string }) => {
      const validatedData = registerSchema.parse(userData);
      const res = await apiRequest('POST', '/api/auth/register', validatedData);
      return res.json();
    },
    onSuccess: (data) => {
      setUser(data.user);
      setIsAuthenticated(true);
      queryClient.invalidateQueries({ queryKey: ['/api/users/me'] });
      toast({
        title: "Registration Successful",
        description: "Welcome to SocialHub!",
      });
      navigate('/feed');
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Failed",
        description: error.message || "Please check your information and try again.",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/auth/logout', {});
      return res.json();
    },
    onSuccess: () => {
      setUser(null);
      setIsAuthenticated(false);
      queryClient.clear();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });
      navigate('/auth');
    },
    onError: () => {
      toast({
        title: "Logout Failed",
        description: "There was an issue logging you out. Please try again.",
        variant: "destructive",
      });
    },
  });

  const login = useCallback(async (username: string, password: string) => {
    await loginMutation.mutateAsync({ username, password });
  }, [loginMutation]);

  const register = useCallback(async (username: string, password: string, name: string) => {
    await registerMutation.mutateAsync({ username, password, name });
  }, [registerMutation]);

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  // Redirect to auth page if not authenticated
  // Добавим запрос для проверки состояния сессии при загрузке
  const checkSessionMutation = useMutation({
    mutationFn: async () => {
      console.log("Checking session status...");
      try {
        const res = await fetch('/api/auth/session', {
          credentials: 'include',
        });
        
        if (res.ok) {
          const data = await res.json();
          console.log("Session is valid:", data);
          return data;
        } else {
          console.log("Session is invalid, status:", res.status);
          return { authenticated: false };
        }
      } catch (error) {
        console.error("Error checking session:", error);
        return { authenticated: false };
      }
    },
    onSuccess: (data) => {
      if (data.authenticated) {
        setUser(data.user);
        setIsAuthenticated(true);
        queryClient.invalidateQueries({ queryKey: ['/api/users/me'] });
      }
    }
  });
  
  // Проверяем сессию при монтировании компонента
  useEffect(() => {
    checkSessionMutation.mutate();
  }, []);
  
  // Редиректим на страницу авторизации, если не авторизован
  useEffect(() => {
    if (!isLoading && !isAuthenticated && window.location.pathname !== '/auth') {
      navigate('/auth');
    }
  }, [isLoading, isAuthenticated, navigate]);

  return {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated,
  };
}

import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PostWithAuthor, AIRecommendation } from "@/types";

export const useFeed = () => {
  const { toast } = useToast();

  const { data: feed, isLoading: feedLoading, error: feedError } = useQuery<PostWithAuthor[]>({
    queryKey: ['/api/posts/feed'],
    staleTime: 60000, // 1 minute
    onError: (error) => {
      console.error("Error fetching feed:", error);
      // Если ошибка 401, то пользователь не авторизован - это нормальное поведение
      if (!(error instanceof Response && error.status === 401)) {
        toast({
          title: "Ошибка загрузки ленты",
          description: "Не удалось загрузить ленту постов",
          variant: "destructive",
        });
      }
    }
  });

  const likeMutation = useMutation({
    mutationFn: async (postId: number) => {
      await apiRequest('POST', `/api/posts/${postId}/like`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
    },
    onError: (error) => {
      console.error("Error liking post:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось поставить лайк. Попробуйте еще раз.",
        variant: "destructive",
      });
    }
  });

  // Рекомендации ИИ (в реальном приложении они бы приходили с API)
  const recommendations: AIRecommendation[] = [
    {
      id: 1,
      title: "Новые тренды веб-дизайна 2023",
      source: "design-magazine.com",
      imageUrl: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3",
      url: "#"
    },
    {
      id: 2,
      title: "Как начать карьеру в IT в 2023",
      source: "tech-career.com",
      imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3",
      url: "#"
    },
    {
      id: 3,
      title: "Будущее искусственного интеллекта",
      source: "ai-insights.org",
      imageUrl: "https://images.unsplash.com/photo-1591453089816-0fbb971b454c?ixlib=rb-4.0.3",
      url: "#"
    },
    {
      id: 4,
      title: "Лучшие языки программирования",
      source: "coder-daily.com",
      imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3",
      url: "#"
    }
  ];

  const createPostMutation = useMutation({
    mutationFn: async (postData: { content: string; mediaUrl?: string }) => {
      console.log("Creating post with data:", postData);
      try {
        const res = await apiRequest('POST', '/api/posts', postData);
        if (!res.ok) {
          const errorData = await res.json().catch(() => null);
          console.error("Post creation failed with status:", res.status, errorData);
          throw new Error(`Failed to create post: ${res.status} ${res.statusText}`);
        }
        const data = await res.json();
        console.log("Post created successfully:", data);
        return data;
      } catch (error) {
        console.error("Exception during post creation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log("Post created successfully, invalidating queries");
      queryClient.invalidateQueries({ queryKey: ['/api/posts/feed'] });
      toast({
        title: "Пост создан",
        description: "Ваш пост успешно опубликован!",
      });
    },
    onError: (error) => {
      console.error("Error in post creation mutation:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось создать пост. Пожалуйста, попробуйте еще раз.",
        variant: "destructive",
      });
    }
  });

  const likePost = async (postId: number) => {
    try {
      await likeMutation.mutateAsync(postId);
    } catch (error) {
      console.error("Error in likePost function:", error);
      throw error;
    }
  };

  const createPost = async (content: string, mediaUrl?: string) => {
    try {
      console.log("Create post function called with:", { content, mediaUrl });
      return await createPostMutation.mutateAsync({ content, mediaUrl });
    } catch (error) {
      console.error("Error in createPost function:", error);
      throw error;
    }
  };

  return {
    feed,
    feedLoading,
    feedError,
    likePost,
    createPost,
    isPending: likeMutation.isPending || createPostMutation.isPending,
    recommendations
  };
};

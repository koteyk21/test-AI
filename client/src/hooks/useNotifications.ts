import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { NotificationWithActor, UnreadCounts } from "@/types";
import { useEffect } from "react";
import { addMessageListener } from "@/lib/websocket";

export const useNotifications = () => {
  const { toast } = useToast();

  // Get all notifications
  const { data: notifications, isLoading: notificationsLoading } = useQuery<NotificationWithActor[]>({
    queryKey: ['/api/notifications'],
    staleTime: 30000, // 30 seconds
  });

  // Get unread counts
  const { data: unreadCounts, isLoading: unreadCountsLoading } = useQuery<UnreadCounts>({
    queryKey: ['/api/notifications/unread-count'],
    staleTime: 30000, // 30 seconds
  });

  // Listen for real-time notifications
  useEffect(() => {
    const removeListener = addMessageListener((wsMessage) => {
      if (wsMessage.type === 'notification' && wsMessage.notification) {
        // Show toast notification
        const notification = wsMessage.notification;
        let notificationText = '';
        
        switch (notification.type) {
          case 'like':
            notificationText = `${notification.actor.name} liked your post`;
            break;
          case 'comment':
            notificationText = `${notification.actor.name} commented on your post`;
            break;
          case 'follow':
            notificationText = `${notification.actor.name} started following you`;
            break;
          case 'message':
            notificationText = `${notification.actor.name} sent you a message`;
            break;
          default:
            notificationText = `New notification from ${notification.actor.name}`;
        }
        
        toast({
          title: "New Notification",
          description: notificationText,
        });
        
        // Invalidate queries to get updated data
        queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
        queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
      }
    });

    return () => removeListener();
  }, [toast]);

  // Mark notification as read
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      await apiRequest('POST', `/api/notifications/${notificationId}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to mark notification as read.",
        variant: "destructive",
      });
    }
  });

  return {
    notifications,
    notificationsLoading,
    unreadCounts,
    unreadCountsLoading,
    markAsRead: (notificationId: number) => markAsReadMutation.mutateAsync(notificationId),
    isPending: markAsReadMutation.isPending
  };
};

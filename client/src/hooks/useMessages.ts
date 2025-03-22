import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { ConversationPreview, MessageWithUser } from "@/types";
import { useEffect, useState } from "react";
import { addMessageListener, sendMessage } from "@/lib/websocket";
import { useAuthContext } from "@/providers/AuthProvider";

export const useMessages = (otherUserId?: number) => {
  const { toast } = useToast();
  const { user } = useAuthContext();
  const [realTimeMessages, setRealTimeMessages] = useState<MessageWithUser[]>([]);

  // Get all conversations
  const { data: conversations, isLoading: conversationsLoading } = useQuery<ConversationPreview[]>({
    queryKey: ['/api/messages/conversations'],
    staleTime: 30000, // 30 seconds
  });

  // Get messages for a specific conversation
  const { data: messages, isLoading: messagesLoading } = useQuery<MessageWithUser[]>({
    queryKey: ['/api/messages', otherUserId],
    enabled: !!otherUserId,
    staleTime: 30000, // 30 seconds
    onSuccess: (data) => {
      setRealTimeMessages(data);
    }
  });

  // Listen for real-time messages
  useEffect(() => {
    if (!user) return;

    const removeListener = addMessageListener((wsMessage) => {
      if (wsMessage.type === 'message_received' || wsMessage.type === 'message_sent') {
        if (wsMessage.message) {
          // For the current conversation, add the message to the real-time list
          if (otherUserId && 
              ((wsMessage.message.senderId === user.id && wsMessage.message.receiverId === otherUserId) || 
               (wsMessage.message.receiverId === user.id && wsMessage.message.senderId === otherUserId))) {
            setRealTimeMessages(prev => {
              // Check if message already exists
              const exists = prev.some(m => m.id === wsMessage.message!.id);
              if (exists) return prev;
              return [...prev, wsMessage.message!].sort((a, b) => 
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
              );
            });
          }
          
          // Always invalidate conversations to update last message
          queryClient.invalidateQueries({ queryKey: ['/api/messages/conversations'] });
          
          // If it's a new message notification, show a toast
          if (wsMessage.type === 'message_received') {
            toast({
              title: "New Message",
              description: `${wsMessage.message.sender.name}: ${wsMessage.message.content.substring(0, 30)}${wsMessage.message.content.length > 30 ? '...' : ''}`,
            });
          }
        }
      }
    });

    return () => removeListener();
  }, [user, otherUserId, toast]);

  // Send message via REST API
  const sendMessageMutation = useMutation({
    mutationFn: async ({ receiverId, content }: { receiverId: number; content: string }) => {
      const res = await apiRequest('POST', `/api/messages/${receiverId}`, { content });
      return res.json();
    },
    onSuccess: (newMessage) => {
      // Add the new message to real-time messages
      setRealTimeMessages(prev => {
        // Check if message already exists
        const exists = prev.some(m => m.id === newMessage.id);
        if (exists) return prev;
        return [...prev, newMessage].sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['/api/messages/conversations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Send message through WebSocket for real-time delivery
  const sendMessageRealTime = async (receiverId: number, content: string) => {
    if (!user) return;
    
    // Send via WebSocket for real-time
    sendMessage(user.id, receiverId, content);
    
    // Also send via REST API as a fallback
    await sendMessageMutation.mutateAsync({ receiverId, content });
  };

  // Mark message as read
  const markAsReadMutation = useMutation({
    mutationFn: async (messageId: number) => {
      await apiRequest('POST', `/api/messages/${messageId}/read`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages/conversations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications/unread-count'] });
    }
  });

  return {
    conversations,
    conversationsLoading,
    messages: realTimeMessages.length > 0 ? realTimeMessages : messages || [],
    messagesLoading,
    sendMessage: sendMessageRealTime,
    markAsRead: (messageId: number) => markAsReadMutation.mutateAsync(messageId),
    isPending: sendMessageMutation.isPending || markAsReadMutation.isPending
  };
};

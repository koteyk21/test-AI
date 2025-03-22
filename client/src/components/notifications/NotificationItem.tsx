import { NotificationWithActor } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/providers/AuthProvider";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { UserPlus } from "lucide-react";

interface NotificationItemProps {
  notification: NotificationWithActor;
  onMarkAsRead: () => void;
}

const NotificationItem = ({ notification, onMarkAsRead }: NotificationItemProps) => {
  const { user: currentUser } = useAuthContext();
  
  const followMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', `/api/users/${notification.actor.id}/follow`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${notification.actor.id}`] });
    }
  });
  
  const handleFollow = async () => {
    await followMutation.mutateAsync();
  };
  
  const getNotificationText = () => {
    switch (notification.type) {
      case 'like':
        return 'liked your post';
      case 'comment':
        return 'commented on your post';
      case 'follow':
        return 'started following you';
      case 'message':
        return 'sent you a message';
      default:
        return 'interacted with your content';
    }
  };
  
  const getNotificationLink = () => {
    switch (notification.type) {
      case 'like':
      case 'comment':
        return `/profile/${currentUser?.id}`; // Go to user's own profile to see the post
      case 'follow':
        return `/profile/${notification.actor.id}`; // Go to follower's profile
      case 'message':
        return `/messages/${notification.actor.id}`; // Go to message conversation
      default:
        return '#';
    }
  };

  return (
    <div 
      className={`${
        notification.read 
          ? 'bg-white dark:bg-gray-800' 
          : 'bg-blue-50 dark:bg-gray-700'
      } p-3 rounded-lg mb-3 flex items-start`}
      onClick={onMarkAsRead}
    >
      <Link href={`/profile/${notification.actor.id}`}>
        <a className="mr-3 flex-shrink-0">
          <Avatar>
            <AvatarImage src={notification.actor.profilePicture} alt={notification.actor.name} />
            <AvatarFallback>{notification.actor.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
        </a>
      </Link>
      
      <div className="flex-1">
        <p className="text-sm">
          <Link href={`/profile/${notification.actor.id}`}>
            <a className="font-medium hover:underline">
              {notification.actor.name}
            </a>
          </Link>{' '}
          <Link href={getNotificationLink()}>
            <a className="hover:underline">
              {getNotificationText()}
            </a>
          </Link>
        </p>
        
        {notification.type === 'comment' && notification.entityId && (
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded">
            "Great post! I'd love to learn more about your approach"
          </p>
        )}
        
        {notification.type === 'follow' && (
          <div className="mt-2 flex space-x-2">
            <Button size="sm" className="text-xs" onClick={handleFollow} disabled={followMutation.isPending}>
              <UserPlus className="h-3 w-3 mr-1" />
              Follow back
            </Button>
            <Button size="sm" variant="outline" className="text-xs">
              Ignore
            </Button>
          </div>
        )}
        
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
        </p>
      </div>
      
      {!notification.read && (
        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2"></div>
      )}
    </div>
  );
};

export default NotificationItem;

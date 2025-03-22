import { useNotifications } from "@/hooks/useNotifications";
import NotificationItem from "@/components/notifications/NotificationItem";
import { Skeleton } from "@/components/ui/skeleton";

const Notifications = () => {
  const { notifications, notificationsLoading, markAsRead } = useNotifications();

  return (
    <>
      <div className="sticky top-0 z-30 bg-white dark:bg-gray-800 shadow-sm p-3">
        <h2 className="text-lg font-semibold">Notifications</h2>
      </div>
      
      <div className="p-4">
        {notificationsLoading ? (
          <>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 p-3 rounded-lg mb-3 flex items-start">
                <Skeleton className="h-10 w-10 rounded-full mr-3 flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </>
        ) : notifications && notifications.length > 0 ? (
          <>
            {notifications.map(notification => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onMarkAsRead={() => markAsRead(notification.id)}
              />
            ))}
          </>
        ) : (
          <div className="text-center p-8">
            <p className="text-gray-500 dark:text-gray-400">No notifications yet</p>
          </div>
        )}
      </div>
    </>
  );
};

export default Notifications;

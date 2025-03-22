import { Home, Compass, Bell, MessageSquare, User, Settings, Plus } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuthContext } from "@/providers/AuthProvider";
import { useNotifications } from "@/hooks/useNotifications";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import CreatePostDialog from "@/components/CreatePostDialog";

const Sidebar = () => {
  const { user } = useAuthContext();
  const { unreadCounts } = useNotifications();
  const [location] = useLocation();
  const [createPostOpen, setCreatePostOpen] = useState(false);

  if (!user) return null;

  return (
    <>
      <div className="hidden md:flex md:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex-col">
        <div className="p-4">
          <div className="flex items-center space-x-3 mb-6">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.profilePicture} alt={user.name} />
              <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-sm">{user.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">@{user.username}</p>
            </div>
          </div>
          
          <nav className="space-y-1">
            <Link href="/feed">
              <a className={`flex items-center space-x-3 p-3 rounded-lg ${
                location === "/feed" 
                  ? "bg-blue-50 dark:bg-gray-700 text-primary dark:text-blue-400" 
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}>
                <Home className="h-5 w-5" />
                <span>Лента</span>
              </a>
            </Link>
            
            <Link href="/explore">
              <a className={`flex items-center space-x-3 p-3 rounded-lg ${
                location === "/explore" 
                  ? "bg-blue-50 dark:bg-gray-700 text-primary dark:text-blue-400" 
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}>
                <Compass className="h-5 w-5" />
                <span>Поиск</span>
              </a>
            </Link>
            
            <Link href="/notifications">
              <a className={`flex items-center space-x-3 p-3 rounded-lg ${
                location === "/notifications" 
                  ? "bg-blue-50 dark:bg-gray-700 text-primary dark:text-blue-400" 
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}>
                <Bell className="h-5 w-5" />
                <span>Уведомления</span>
                {unreadCounts?.notifications > 0 && (
                  <Badge variant="destructive" className="ml-auto">
                    {unreadCounts.notifications}
                  </Badge>
                )}
              </a>
            </Link>
            
            <Link href="/messages">
              <a className={`flex items-center space-x-3 p-3 rounded-lg ${
                location.startsWith("/messages") 
                  ? "bg-blue-50 dark:bg-gray-700 text-primary dark:text-blue-400" 
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}>
                <MessageSquare className="h-5 w-5" />
                <span>Сообщения</span>
                {unreadCounts?.messages > 0 && (
                  <Badge variant="destructive" className="ml-auto">
                    {unreadCounts.messages}
                  </Badge>
                )}
              </a>
            </Link>
            
            <Link href="/profile">
              <a className={`flex items-center space-x-3 p-3 rounded-lg ${
                location === "/profile" 
                  ? "bg-blue-50 dark:bg-gray-700 text-primary dark:text-blue-400" 
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}>
                <User className="h-5 w-5" />
                <span>Профиль</span>
              </a>
            </Link>
            
            <Link href="/settings">
              <a className={`flex items-center space-x-3 p-3 rounded-lg ${
                location === "/settings" 
                  ? "bg-blue-50 dark:bg-gray-700 text-primary dark:text-blue-400" 
                  : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
              }`}>
                <Settings className="h-5 w-5" />
                <span>Настройки</span>
              </a>
            </Link>
          </nav>
        </div>
        
        <div className="mt-auto p-4 border-t border-gray-200 dark:border-gray-700">
          <Button 
            className="w-full flex items-center justify-center space-x-2"
            onClick={() => setCreatePostOpen(true)}
          >
            <Plus className="h-4 w-4" />
            <span>Создать пост</span>
          </Button>
        </div>
      </div>
      
      <CreatePostDialog open={createPostOpen} onOpenChange={setCreatePostOpen} />
    </>
  );
};

export default Sidebar;

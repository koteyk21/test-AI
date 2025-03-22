import { Bell, MessageSquare, Search } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuthContext } from "@/providers/AuthProvider";
import { useNotifications } from "@/hooks/useNotifications";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Header = () => {
  const { user } = useAuthContext();
  const { unreadCounts } = useNotifications();

  return (
    <header className="bg-card/90 backdrop-blur-sm border-b border-border/40 py-3 px-4 flex items-center justify-between fixed top-0 left-0 right-0 z-40">
      <div className="flex items-center">
        <Link href="/feed">
          <div className="flex items-center mr-2 cursor-pointer">
            <h1 className="text-xl font-bold text-primary mr-2">
              СоцСеть
            </h1>
            <span className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-2 py-0.5 rounded-full">
              AI
            </span>
          </div>
        </Link>
      </div>
      
      <div className="hidden md:flex items-center relative max-w-xs w-full mx-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Поиск..." 
          className="pl-9 pr-4 h-9 focus-visible:ring-primary/20"
        />
      </div>
      
      <div className="flex items-center space-x-1 md:space-x-3">
        <div className="hidden sm:block">
          <ThemeToggle />
        </div>
        
        <Link href="/notifications">
          <Button variant="ghost" size="icon" className="rounded-full relative">
            <Bell className="h-5 w-5" />
            {unreadCounts?.notifications > 0 && (
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]">
                {unreadCounts.notifications}
              </Badge>
            )}
          </Button>
        </Link>
        
        <Link href="/messages">
          <Button variant="ghost" size="icon" className="rounded-full relative">
            <MessageSquare className="h-5 w-5" />
            {unreadCounts?.messages > 0 && (
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]">
                {unreadCounts.messages}
              </Badge>
            )}
          </Button>
        </Link>
        
        <Link href="/profile">
          <div className="h-9 w-9 cursor-pointer">
            <Avatar className="border-2 border-primary/20">
              <AvatarImage src={user?.profilePicture || ""} alt={user?.name || ""} />
              <AvatarFallback>{user?.name?.substring(0, 2) || "..."}</AvatarFallback>
            </Avatar>
          </div>
        </Link>
      </div>
    </header>
  );
};

export default Header;

import { Home, Compass, PlusCircle, Bell, User } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useNotifications } from "@/hooks/useNotifications";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import CreatePostDialog from "@/components/CreatePostDialog";
import { ThemeToggle } from "@/components/ThemeToggle";

const MobileNav = () => {
  const [location] = useLocation();
  const { unreadCounts } = useNotifications();
  const [createPostOpen, setCreatePostOpen] = useState(false);

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border/40 flex justify-around py-2 z-40">
        <Link href="/feed">
          <div className="flex flex-col items-center p-2 text-muted-foreground">
            <Home className={`h-5 w-5 ${location === "/feed" ? "text-primary" : ""}`} />
            <span className={`text-xs mt-1 ${location === "/feed" ? "text-primary font-medium" : ""}`}>Лента</span>
          </div>
        </Link>
        
        <Link href="/explore">
          <div className="flex flex-col items-center p-2 text-muted-foreground">
            <Compass className={`h-5 w-5 ${location === "/explore" ? "text-primary" : ""}`} />
            <span className={`text-xs mt-1 ${location === "/explore" ? "text-primary font-medium" : ""}`}>Поиск</span>
          </div>
        </Link>
        
        <div 
          className="flex flex-col items-center p-2 text-muted-foreground relative cursor-pointer"
          onClick={() => setCreatePostOpen(true)}
        >
          <div className="flex items-center justify-center rounded-full w-10 h-10 bg-primary/10 mb-1">
            <PlusCircle className="h-6 w-6 text-primary" />
          </div>
          <span className="text-xs absolute -bottom-1">Создать</span>
        </div>
        
        <Link href="/notifications">
          <div className="flex flex-col items-center p-2 text-muted-foreground relative">
            <Bell className={`h-5 w-5 ${location === "/notifications" ? "text-primary" : ""}`} />
            {unreadCounts?.notifications > 0 && (
              <Badge variant="destructive" className="absolute top-1 right-1 h-4 w-4 flex items-center justify-center p-0 text-[10px]">
                {unreadCounts.notifications}
              </Badge>
            )}
            <span className={`text-xs mt-1 ${location === "/notifications" ? "text-primary font-medium" : ""}`}>Уведомления</span>
          </div>
        </Link>
        
        <Link href="/profile">
          <div className="flex flex-col items-center p-2 text-muted-foreground">
            <User className={`h-5 w-5 ${location === "/profile" ? "text-primary" : ""}`} />
            <span className={`text-xs mt-1 ${location === "/profile" ? "text-primary font-medium" : ""}`}>Профиль</span>
          </div>
        </Link>
      </nav>
      
      <div className="md:hidden fixed bottom-16 right-4 z-40">
        <ThemeToggle />
      </div>
      
      <CreatePostDialog open={createPostOpen} onOpenChange={setCreatePostOpen} />
    </>
  );
};

export default MobileNav;

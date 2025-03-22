import { ReactNode, useEffect } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import { useAuthContext } from "@/providers/AuthProvider";
import { setupWebSocket, closeWebSocket } from "@/lib/websocket";
import { useLocation } from "wouter";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { user, isAuthenticated } = useAuthContext();
  const [location] = useLocation();

  // Setup WebSocket connection when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setupWebSocket(user.id);
    }
    
    return () => {
      closeWebSocket();
    };
  }, [isAuthenticated, user]);

  // Don't show layout on auth page
  if (location === "/auth") {
    return <>{children}</>;
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      
      <main className="flex flex-1 pt-14 pb-16 md:pb-0 md:pt-16 overflow-hidden">
        <Sidebar />
        
        <div className="flex-1 overflow-y-auto relative">
          {children}
        </div>
      </main>
      
      <MobileNav />
    </div>
  );
};

export default Layout;

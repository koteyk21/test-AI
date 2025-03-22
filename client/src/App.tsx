import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "./providers/AuthProvider";
import { ThemeProvider } from "@/components/ui/theme-provider";

// Page Components
import Layout from "@/components/Layout";
import Auth from "@/pages/Auth";
import Home from "@/pages/Home";
import Feed from "@/pages/Feed";
import Profile from "@/pages/Profile";
import Messages from "@/pages/Messages";
import Notifications from "@/pages/Notifications";
import Explore from "@/pages/Explore";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={Auth} />
      
      {/* Protected Routes */}
      <Route path="/" component={Home} />
      <Route path="/feed" component={Feed} />
      <Route path="/profile" component={Profile} />
      <Route path="/profile/:id" component={Profile} />
      <Route path="/messages" component={Messages} />
      <Route path="/messages/:id" component={Messages} />
      <Route path="/notifications" component={Notifications} />
      <Route path="/explore" component={Explore} />
      <Route path="/settings" component={Settings} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="socialhub-theme">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Layout>
            <Router />
          </Layout>
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;

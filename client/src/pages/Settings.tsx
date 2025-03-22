import { useState } from "react";
import { useAuthContext } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTheme } from "@/components/ui/theme-provider";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Moon, Sun, Bell, Lock, User, LogOut, Upload, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { user, logout } = useAuthContext();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Form states
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    profilePicture: user?.profilePicture || "",
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    newMessages: true,
    newFollowers: true,
    postLikes: true,
    postComments: true,
  });
  
  const handleProfileUpdate = () => {
    setIsUpdating(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setIsUpdating(false);
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully.",
      });
    }, 1000);
  };
  
  const handlePasswordUpdate = () => {
    toast({
      title: "Feature Not Available",
      description: "Password change functionality is not implemented in this demo.",
      variant: "destructive",
    });
  };
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="container py-6 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <div className="space-y-6">
        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <User className="mr-2 h-5 w-5" />
              Profile Settings
            </CardTitle>
            <CardDescription>
              Update your personal information and profile picture
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user?.profilePicture} alt={user?.name} />
                <AvatarFallback className="text-xl">{user?.name?.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">Profile Picture</label>
                <div className="flex">
                  <Input 
                    value={profileData.profilePicture} 
                    onChange={(e) => setProfileData({...profileData, profilePicture: e.target.value})}
                    placeholder="Profile picture URL"
                    className="flex-1"
                  />
                  <Button variant="outline" className="ml-2">
                    <Upload className="h-4 w-4 mr-2" />
                    Browse
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Name</label>
              <Input 
                value={profileData.name} 
                onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                placeholder="Your name"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Bio</label>
              <Textarea 
                value={profileData.bio} 
                onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                placeholder="Tell us about yourself"
                rows={4}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleProfileUpdate} disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Updating...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </CardFooter>
        </Card>
        
        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="mr-2 h-5 w-5" />
              Security Settings
            </CardTitle>
            <CardDescription>
              Manage your account security and password
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Password</label>
              <Input type="password" placeholder="Enter current password" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">New Password</label>
              <Input type="password" placeholder="Enter new password" />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm New Password</label>
              <Input type="password" placeholder="Confirm new password" />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handlePasswordUpdate}>Update Password</Button>
          </CardFooter>
        </Card>
        
        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Bell className="mr-2 h-5 w-5" />
              Notification Settings
            </CardTitle>
            <CardDescription>
              Control which notifications you receive
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">New Messages</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when you receive new messages</p>
              </div>
              <Switch 
                checked={notificationSettings.newMessages} 
                onCheckedChange={(checked) => 
                  setNotificationSettings({...notificationSettings, newMessages: checked})
                }
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">New Followers</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when someone follows you</p>
              </div>
              <Switch 
                checked={notificationSettings.newFollowers} 
                onCheckedChange={(checked) => 
                  setNotificationSettings({...notificationSettings, newFollowers: checked})
                }
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Post Likes</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when your posts are liked</p>
              </div>
              <Switch 
                checked={notificationSettings.postLikes} 
                onCheckedChange={(checked) => 
                  setNotificationSettings({...notificationSettings, postLikes: checked})
                }
              />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Post Comments</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when your posts receive comments</p>
              </div>
              <Switch 
                checked={notificationSettings.postComments} 
                onCheckedChange={(checked) => 
                  setNotificationSettings({...notificationSettings, postComments: checked})
                }
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              {theme === "dark" ? (
                <Moon className="mr-2 h-5 w-5" />
              ) : (
                <Sun className="mr-2 h-5 w-5" />
              )}
              Appearance
            </CardTitle>
            <CardDescription>
              Customize how SocialHub looks for you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Switch between light and dark themes</p>
              </div>
              <Switch 
                checked={theme === "dark"} 
                onCheckedChange={(checked) => 
                  setTheme(checked ? "dark" : "light")
                }
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-red-500">Account Actions</CardTitle>
            <CardDescription>
              Manage your account status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;

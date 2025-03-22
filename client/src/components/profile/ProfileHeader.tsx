import { UserWithStats } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/providers/AuthProvider";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

interface ProfileHeaderProps {
  user: UserWithStats;
}

const ProfileHeader = ({ user }: ProfileHeaderProps) => {
  const { user: currentUser } = useAuthContext();
  const isOwnProfile = user.id === currentUser?.id;
  
  const followMutation = useMutation({
    mutationFn: async () => {
      if (user.isFollowing) {
        await apiRequest('POST', `/api/users/${user.id}/unfollow`, {});
      } else {
        await apiRequest('POST', `/api/users/${user.id}/follow`, {});
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user.id}`] });
    }
  });
  
  const handleFollowToggle = async () => {
    await followMutation.mutateAsync();
  };

  return (
    <>
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-40 relative">
        <div className="absolute left-1/2 transform -translate-x-1/2 -bottom-16">
          <Avatar className="h-32 w-32 border-4 border-white dark:border-gray-800">
            <AvatarImage src={user.profilePicture} alt={user.name} />
            <AvatarFallback className="text-2xl">{user.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
        </div>
      </div>
      
      <div className="mt-20 text-center p-4">
        <h2 className="text-xl font-bold">{user.name}</h2>
        <p className="text-gray-500 dark:text-gray-400">@{user.username}</p>
        
        {user.bio && (
          <p className="mt-2 max-w-md mx-auto">{user.bio}</p>
        )}
        
        <div className="flex justify-center space-x-6 mt-4">
          <div className="text-center">
            <p className="font-bold">{user.stats.posts}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Posts</p>
          </div>
          <div className="text-center">
            <p className="font-bold">{user.stats.followers}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Followers</p>
          </div>
          <div className="text-center">
            <p className="font-bold">{user.stats.following}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Following</p>
          </div>
        </div>
        
        {isOwnProfile ? (
          <Button className="mt-4" variant="outline">
            Edit Profile
          </Button>
        ) : (
          <Button 
            className="mt-4"
            variant={user.isFollowing ? "outline" : "default"}
            onClick={handleFollowToggle}
            disabled={followMutation.isPending}
          >
            {followMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              user.isFollowing ? "Unfollow" : "Follow"
            )}
          </Button>
        )}
      </div>
    </>
  );
};

export default ProfileHeader;

import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "@/providers/AuthProvider";
import { UserWithStats } from "@/types";
import ProfileHeader from "@/components/profile/ProfileHeader";
import PostGrid from "@/components/profile/PostGrid";
import { Post } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

const Profile = () => {
  const params = useParams();
  const { user: currentUser } = useAuthContext();
  const [profileUser, setProfileUser] = useState<UserWithStats | null>(null);
  
  // If id param exists, fetch that user, otherwise use current user
  const userId = params.id ? parseInt(params.id) : currentUser?.id;

  // Fetch user data
  const { data: userData, isLoading: userLoading } = useQuery<UserWithStats>({
    queryKey: userId !== currentUser?.id ? [`/api/users/${userId}`] : ['/api/users/me'],
    enabled: !!userId,
  });

  // Fetch user posts
  const { data: userPosts, isLoading: postsLoading } = useQuery<Post[]>({
    queryKey: [`/api/users/${userId}/posts`],
    enabled: !!userId,
  });

  useEffect(() => {
    if (userData) {
      setProfileUser(userData);
    }
  }, [userData]);

  if (userLoading || !profileUser) {
    return (
      <div className="animate-pulse">
        <Skeleton className="h-40 w-full" />
        <div className="flex justify-center mt-4">
          <Skeleton className="h-32 w-32 rounded-full" />
        </div>
        <div className="mt-20 text-center p-4">
          <Skeleton className="h-6 w-32 mx-auto" />
          <Skeleton className="h-4 w-24 mx-auto mt-2" />
          <Skeleton className="h-16 w-full max-w-md mx-auto mt-4" />
        </div>
      </div>
    );
  }

  return (
    <>
      <ProfileHeader user={profileUser} />
      
      <div className="mt-6 p-4">
        <Tabs defaultValue="posts">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="mt-4">
            {postsLoading ? (
              <div className="grid grid-cols-3 gap-1">
                {[...Array(9)].map((_, i) => (
                  <Skeleton key={i} className="aspect-square" />
                ))}
              </div>
            ) : (
              <PostGrid posts={userPosts || []} />
            )}
          </TabsContent>
          
          <TabsContent value="media" className="mt-4">
            {postsLoading ? (
              <div className="grid grid-cols-3 gap-1">
                {[...Array(9)].map((_, i) => (
                  <Skeleton key={i} className="aspect-square" />
                ))}
              </div>
            ) : (
              <PostGrid posts={(userPosts || []).filter(post => post.mediaUrl)} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Profile;

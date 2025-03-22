import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PostWithAuthor } from "@/types";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Compass, TrendingUp, Heart, MessageSquare, Share2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: posts, isLoading } = useQuery<PostWithAuthor[]>({
    queryKey: ['/api/posts'],
  });
  
  // Filter posts based on search query
  const filteredPosts = posts?.filter(post => 
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="sticky top-0 z-30 bg-white dark:bg-gray-800 shadow-sm p-3">
        <h2 className="text-lg font-semibold mb-3">Explore</h2>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search for posts, people, or topics..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <Tabs defaultValue="trending" className="p-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="trending">
            <TrendingUp className="h-4 w-4 mr-2" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="discover">
            <Compass className="h-4 w-4 mr-2" />
            Discover
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="trending" className="mt-4 space-y-4">
          {isLoading ? (
            <>
              {[...Array(3)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-0">
                    <div className="p-3 flex items-center space-x-2 border-b border-gray-100 dark:border-gray-700">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-48 w-full" />
                    <div className="p-4 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          ) : (
            <>
              {(filteredPosts || []).map(post => (
                <Card key={post.id}>
                  <CardContent className="p-0">
                    <div className="p-3 flex items-center space-x-2 border-b border-gray-100 dark:border-gray-700">
                      <Link href={`/profile/${post.author.id}`}>
                        <a className="cursor-pointer">
                          <Avatar>
                            <AvatarImage src={post.author.profilePicture} alt={post.author.name} />
                            <AvatarFallback>{post.author.name.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                        </a>
                      </Link>
                      <div>
                        <Link href={`/profile/${post.author.id}`}>
                          <a className="font-medium text-sm cursor-pointer hover:underline">
                            {post.author.name}
                          </a>
                        </Link>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    
                    {post.mediaUrl && (
                      <div className="aspect-video bg-gray-100 dark:bg-gray-700">
                        <img 
                          src={post.mediaUrl} 
                          alt="Post content" 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = "https://via.placeholder.com/600x400?text=Image+Not+Available";
                          }}
                        />
                      </div>
                    )}
                    
                    <div className="p-4">
                      <p className="mb-2">{post.content}</p>
                    </div>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between py-2 px-4 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      <button className="flex items-center space-x-1 text-gray-600 dark:text-gray-300">
                        <Heart className="h-5 w-5" />
                        <span>{post.likes}</span>
                      </button>
                      <button className="flex items-center space-x-1 text-gray-600 dark:text-gray-300">
                        <MessageSquare className="h-5 w-5" />
                        <span>{post.comments}</span>
                      </button>
                    </div>
                    <button className="text-gray-600 dark:text-gray-300">
                      <Share2 className="h-5 w-5" />
                    </button>
                  </CardFooter>
                </Card>
              ))}
              
              {filteredPosts?.length === 0 && (
                <div className="text-center p-8">
                  <p className="text-gray-500 dark:text-gray-400">
                    No posts found matching your search
                  </p>
                </div>
              )}
            </>
          )}
        </TabsContent>
        
        <TabsContent value="discover" className="mt-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {isLoading ? (
              <>
                {[...Array(9)].map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-md" />
                ))}
              </>
            ) : (
              <>
                {(filteredPosts || [])
                  .filter(post => post.mediaUrl)
                  .map(post => (
                    <div key={post.id} className="aspect-square bg-gray-100 dark:bg-gray-700 rounded-md overflow-hidden relative group">
                      <img 
                        src={post.mediaUrl} 
                        alt="Discovery" 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://via.placeholder.com/400?text=Image+Not+Available";
                        }}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity">
                        <p className="text-white text-sm font-medium mb-2 px-2 text-center line-clamp-2">
                          {post.content}
                        </p>
                        <div className="flex items-center space-x-3 text-white">
                          <div className="flex items-center">
                            <Heart className="h-4 w-4 mr-1" />
                            <span className="text-xs">{post.likes}</span>
                          </div>
                          <div className="flex items-center">
                            <MessageSquare className="h-4 w-4 mr-1" />
                            <span className="text-xs">{post.comments}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                {(!filteredPosts || filteredPosts.filter(post => post.mediaUrl).length === 0) && (
                  <div className="col-span-full text-center p-8">
                    <p className="text-gray-500 dark:text-gray-400">
                      No media posts found
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </>
  );
};

export default Explore;

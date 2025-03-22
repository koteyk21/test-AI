import { Post } from "@shared/schema";
import { Heart, MessageSquare } from "lucide-react";

interface PostGridProps {
  posts: Post[];
}

const PostGrid = ({ posts }: PostGridProps) => {
  if (posts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">No posts yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1">
      {posts.map(post => (
        <div key={post.id} className="aspect-square bg-gray-100 dark:bg-gray-700 relative group">
          {post.mediaUrl ? (
            <img 
              src={post.mediaUrl} 
              alt="Post" 
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://via.placeholder.com/400?text=No+Image";
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center p-2 overflow-hidden">
              <p className="text-xs text-center line-clamp-4">{post.content}</p>
            </div>
          )}
          
          <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 flex items-center justify-center space-x-4 transition-opacity">
            <div className="flex items-center text-white">
              <Heart className="mr-1 h-4 w-4" />
              <span>{post.likes}</span>
            </div>
            <div className="flex items-center text-white">
              <MessageSquare className="mr-1 h-4 w-4" />
              <span>{post.comments}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostGrid;

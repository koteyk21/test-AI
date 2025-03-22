import { useState, useRef, useEffect } from "react";
import { PostWithAuthor } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageSquare, Share2, MoreHorizontal } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { motion, useAnimation, PanInfo } from "framer-motion";
import { useFeed } from "@/hooks/useFeed";

interface SwipeableCardProps {
  post: PostWithAuthor;
  onSwipe: (direction: 'left' | 'right') => void;
  style?: React.CSSProperties;
  zIndex: number;
}

const SwipeableCard = ({ post, onSwipe, style, zIndex }: SwipeableCardProps) => {
  const [startX, setStartX] = useState(0);
  const [liked, setLiked] = useState(false);
  const { likePost } = useFeed();
  const controls = useAnimation();
  
  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!liked) {
      setLiked(true);
      await likePost(post.id);
    }
  };
  
  const handleDragStart = (_: any, info: PanInfo) => {
    setStartX(info.point.x);
  };
  
  const handleDragEnd = async (_: any, info: PanInfo) => {
    const diffX = info.point.x - startX;
    
    if (Math.abs(diffX) > 100) {
      // Swipe was significant
      const direction = diffX > 0 ? 'right' : 'left';
      
      // Animate card off screen
      await controls.start({
        x: direction === 'right' ? 1000 : -1000,
        rotate: direction === 'right' ? 45 : -45,
        transition: { duration: 0.3 }
      });
      
      // If swiped right (interested), like the post
      if (direction === 'right' && !liked) {
        setLiked(true);
        await likePost(post.id);
      }
      
      // Notify parent about swipe
      onSwipe(direction);
    } else {
      // Reset position if not swiped enough
      controls.start({ x: 0, rotate: 0, transition: { type: "spring", stiffness: 300, damping: 20 } });
    }
  };

  return (
    <motion.div
      className="swipe-card absolute top-0 left-0 right-0 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden"
      style={{ ...style, zIndex }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      animate={controls}
      initial={{ rotate: style?.rotate || 0 }}
    >
      <div className="p-3 flex items-center space-x-2 border-b border-gray-100 dark:border-gray-700">
        <Avatar>
          <AvatarImage src={post.author.profilePicture} alt={post.author.name} />
          <AvatarFallback>{post.author.name.substring(0, 2)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-sm">{post.author.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </p>
        </div>
        <button className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>
      
      {post.mediaUrl && (
        <div className="aspect-w-16 aspect-h-9 bg-gray-100 dark:bg-gray-700">
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
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-3">
            <button 
              className="flex items-center space-x-1 text-gray-600 dark:text-gray-300"
              onClick={handleLike}
            >
              <Heart className={`h-5 w-5 ${liked ? "fill-pink-500 text-pink-500" : ""}`} />
              <span>{liked ? post.likes + 1 : post.likes}</span>
            </button>
            <button className="flex items-center space-x-1 text-gray-600 dark:text-gray-300">
              <MessageSquare className="h-5 w-5" />
              <span>{post.comments}</span>
            </button>
          </div>
          <button className="text-gray-600 dark:text-gray-300">
            <Share2 className="h-5 w-5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default SwipeableCard;

import { useState, useEffect } from "react";
import SwipeableCard from "@/components/feed/SwipeableCard";
import { PostWithAuthor } from "@/types";

interface CardDeckProps {
  posts: PostWithAuthor[];
  onEmpty?: () => void;
}

const CardDeck = ({ posts, onEmpty }: CardDeckProps) => {
  const [visiblePosts, setVisiblePosts] = useState<PostWithAuthor[]>([]);
  
  useEffect(() => {
    // Only take the first 5 posts for the initial deck
    setVisiblePosts(posts.slice(0, 5));
  }, [posts]);
  
  const handleSwipe = (direction: 'left' | 'right', index: number) => {
    setVisiblePosts(prev => {
      const newPosts = [...prev];
      newPosts.splice(index, 1);
      
      // Add a new post from the pool if available
      if (newPosts.length < 3) {
        const nextIndex = posts.findIndex(post => !newPosts.some(p => p.id === post.id) && !prev.some(p => p.id === post.id));
        if (nextIndex !== -1) {
          newPosts.push(posts[nextIndex]);
        }
      }
      
      // Notify when deck is empty
      if (newPosts.length === 0 && onEmpty) {
        onEmpty();
      }
      
      return newPosts;
    });
  };
  
  if (visiblePosts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 dark:text-gray-400">No more posts to show</p>
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-md px-4 pb-4 h-[450px]">
      {visiblePosts.map((post, index) => (
        <SwipeableCard
          key={post.id}
          post={post}
          onSwipe={(direction) => handleSwipe(direction, index)}
          style={{ 
            rotate: index % 2 === 0 ? -1 : 1,
            zIndex: visiblePosts.length - index 
          }}
          zIndex={visiblePosts.length - index}
        />
      ))}
    </div>
  );
};

export default CardDeck;

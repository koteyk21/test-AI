import { Sparkles, ArrowLeft, ArrowRight, Plus } from "lucide-react";
import CardDeck from "@/components/feed/CardDeck";
import RecommendationCard from "@/components/feed/RecommendationCard";
import { useFeed } from "@/hooks/useFeed";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import CreatePostDialog from "@/components/CreatePostDialog";
import { useToast } from "@/hooks/use-toast";

const Feed = () => {
  const { feed, feedLoading, recommendations, createPost, isPending } = useFeed();
  const [shouldRefresh, setShouldRefresh] = useState(false);
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const { toast } = useToast();

  // Для отладки: выводим данные о ленте
  useEffect(() => {
    console.log("Feed data:", { feed, feedLoading, isPending });
  }, [feed, feedLoading, isPending]);

  // Тестовая функция создания поста для отладки
  const handleTestPost = async () => {
    try {
      console.log("Trying to create test post...");
      await createPost("Тестовый пост для проверки функциональности");
      toast({
        title: "Пост создан",
        description: "Тестовый пост был успешно создан!",
      });
    } catch (error) {
      console.error("Error creating test post:", error);
      toast({
        variant: "destructive",
        title: "Ошибка",
        description: "Не удалось создать тестовый пост",
      });
    }
  };

  // Refresh the feed when the deck is empty
  useEffect(() => {
    if (shouldRefresh) {
      // In a real app, we'd fetch more posts
      // For demo purposes, just reset the flag
      setShouldRefresh(false);
    }
  }, [shouldRefresh]);

  return (
    <>
      {/* Sub-header with AI info */}
      <div className="sticky top-0 z-30 bg-card/95 backdrop-blur-sm border-b border-border/40 p-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Лента</h2>
        <div className="flex items-center space-x-2 text-xs bg-primary/5 text-primary rounded-full px-3 py-1">
          <Sparkles className="h-4 w-4" />
          <span>ИИ рекомендации включены</span>
        </div>
      </div>

      {/* Debugging buttons */}
      <div className="flex justify-center mt-3 space-x-3">
        <Button 
          size="sm" 
          variant="outline" 
          onClick={() => setCreatePostOpen(true)}
          className="flex items-center"
        >
          <Plus className="mr-1 h-4 w-4" />
          Создать пост
        </Button>
        <Button 
          size="sm" 
          variant="secondary" 
          onClick={handleTestPost} 
          disabled={isPending}
        >
          {isPending ? "Создание..." : "Тестовый пост"}
        </Button>
      </div>

      {/* Swipe Instructions */}
      <div className="text-center py-3 text-sm text-muted-foreground flex items-center justify-center space-x-4">
        <div className="flex items-center">
          <ArrowLeft className="text-pink-500 mr-1 h-4 w-4" />
          <span>Пропустить</span>
        </div>
        <div className="flex items-center">
          <ArrowRight className="text-green-500 mr-1 h-4 w-4" />
          <span>Интересно</span>
        </div>
      </div>

      {/* Card Deck */}
      {feedLoading ? (
        <div className="relative mx-auto max-w-md px-4 pb-4 h-[450px]">
          <Skeleton className="absolute top-0 left-4 right-4 h-[400px] rounded-xl" />
        </div>
      ) : (
        <CardDeck 
          posts={feed || []} 
          onEmpty={() => setShouldRefresh(true)}
        />
      )}

      {/* AI Recommendations */}
      <div className="p-4 mx-auto max-w-md">
        <h3 className="text-lg font-semibold mb-3 flex items-center">
          <Sparkles className="text-primary mr-2 h-5 w-5" />
          Рекомендации ИИ
        </h3>
        
        {feedLoading ? (
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-36 rounded-lg" />
            <Skeleton className="h-36 rounded-lg" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {recommendations.map(recommendation => (
              <RecommendationCard 
                key={recommendation.id} 
                recommendation={recommendation} 
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Post Dialog */}
      <CreatePostDialog open={createPostOpen} onOpenChange={setCreatePostOpen} />
    </>
  );
};

export default Feed;

import { AIRecommendation } from "@/types";

interface RecommendationCardProps {
  recommendation: AIRecommendation;
}

const RecommendationCard = ({ recommendation }: RecommendationCardProps) => {
  return (
    <a href={recommendation.url} target="_blank" rel="noopener noreferrer" className="block">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden h-full">
        <div className="h-24 bg-gray-100 dark:bg-gray-700">
          <img 
            src={recommendation.imageUrl} 
            alt={recommendation.title} 
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://via.placeholder.com/300x200?text=Image+Not+Available";
            }}
          />
        </div>
        <div className="p-2">
          <p className="text-xs font-medium truncate">{recommendation.title}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{recommendation.source}</p>
        </div>
      </div>
    </a>
  );
};

export default RecommendationCard;

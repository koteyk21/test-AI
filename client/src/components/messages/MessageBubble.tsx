import { MessageWithUser } from "@/types";
import { format } from "date-fns";
import { Check, CheckCheck } from "lucide-react";

interface MessageBubbleProps {
  message: MessageWithUser;
  isSent: boolean;
}

const MessageBubble = ({ message, isSent }: MessageBubbleProps) => {
  const formattedTime = format(new Date(message.createdAt), "HH:mm");
  
  return (
    <div className={`flex flex-col ${isSent ? "items-end" : "items-start"}`}>
      <div 
        className={`max-w-xs md:max-w-sm p-3 rounded-lg ${
          isSent 
            ? "bg-primary text-white message-bubble-sent" 
            : "bg-gray-100 dark:bg-gray-700 message-bubble-received"
        }`}
      >
        {message.content.match(/\.(jpg|jpeg|png|gif)$/i) ? (
          <div className="overflow-hidden rounded">
            <img 
              src={message.content} 
              alt="Message attachment" 
              className="w-full rounded"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "https://via.placeholder.com/300?text=Image+Not+Available";
              }}
            />
          </div>
        ) : (
          <p className="text-sm">{message.content}</p>
        )}
      </div>
      <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center">
        {formattedTime}
        {isSent && (
          message.read 
            ? <CheckCheck className="ml-1 h-3 w-3 text-blue-500" /> 
            : <Check className="ml-1 h-3 w-3" />
        )}
      </span>
    </div>
  );
};

export default MessageBubble;

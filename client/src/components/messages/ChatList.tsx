import { ConversationPreview } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";

interface ChatListProps {
  conversations: ConversationPreview[];
  currentUserId?: number;
}

const ChatList = ({ conversations, currentUserId }: ChatListProps) => {
  if (!conversations || conversations.length === 0) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500 dark:text-gray-400">No conversations yet</p>
      </div>
    );
  }

  return (
    <div className="w-full md:w-1/3 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
      {conversations.map(convo => (
        <Link key={convo.user.id} href={`/messages/${convo.user.id}`}>
          <a className="p-3 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer flex items-center">
            <div className="relative mr-3 flex-shrink-0">
              <Avatar>
                <AvatarImage src={convo.user.profilePicture} alt={convo.user.name} />
                <AvatarFallback>{convo.user.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <div className={`absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white dark:border-gray-800 ${
                Math.random() > 0.5 ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
              }`}></div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-baseline">
                <h4 className="font-medium text-sm truncate">{convo.user.name}</h4>
                <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0">
                  {formatDistanceToNow(new Date(convo.lastMessage.createdAt), { addSuffix: false })}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {convo.lastMessage.senderId === currentUserId ? "You: " : ""}
                {convo.lastMessage.content}
              </p>
            </div>
            {convo.unreadCount > 0 && (
              <div className="ml-2 flex-shrink-0">
                <div className="h-5 w-5 bg-primary text-white text-xs flex items-center justify-center rounded-full">
                  {convo.unreadCount}
                </div>
              </div>
            )}
          </a>
        </Link>
      ))}
    </div>
  );
};

export default ChatList;

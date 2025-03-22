import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuthContext } from "@/providers/AuthProvider";
import { useMessages } from "@/hooks/useMessages";
import ChatList from "@/components/messages/ChatList";
import ChatWindow from "@/components/messages/ChatWindow";
import { Skeleton } from "@/components/ui/skeleton";
import { User } from "@shared/schema";

const Messages = () => {
  const params = useParams();
  const { user: currentUser } = useAuthContext();
  const otherUserId = params.id ? parseInt(params.id) : undefined;
  
  const { 
    conversations, 
    conversationsLoading, 
    messages, 
    messagesLoading, 
    sendMessage, 
    isPending 
  } = useMessages(otherUserId);

  // Fetch details of the current conversation partner
  const { data: otherUser, isLoading: otherUserLoading } = useQuery<User>({
    queryKey: [`/api/users/${otherUserId}`],
    enabled: !!otherUserId,
  });

  return (
    <>
      <div className="sticky top-0 z-30 bg-white dark:bg-gray-800 shadow-sm p-3">
        <h2 className="text-lg font-semibold">Messages</h2>
      </div>
      
      <div className="flex-1 flex">
        {/* Chat List */}
        {conversationsLoading ? (
          <div className="w-full md:w-1/3 border-r border-gray-200 dark:border-gray-700 p-3 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ChatList 
            conversations={conversations || []} 
            currentUserId={currentUser?.id}
          />
        )}
        
        {/* Chat Window */}
        {otherUserId && otherUser ? (
          <ChatWindow
            messages={messages}
            otherUser={otherUser}
            currentUserId={currentUser?.id || 0}
            onSendMessage={(content) => sendMessage(otherUserId, content)}
            loading={messagesLoading || isPending}
          />
        ) : (
          <div className="hidden md:flex flex-col flex-1 items-center justify-center">
            <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Choose a chat from the list to start messaging
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default Messages;

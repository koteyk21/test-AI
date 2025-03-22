import { useState, useEffect, useRef } from "react";
import { MessageWithUser } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User } from "@shared/schema";
import MessageBubble from "@/components/messages/MessageBubble";
import { Phone, Video, Info, Paperclip, Send } from "lucide-react";

interface ChatWindowProps {
  messages: MessageWithUser[];
  otherUser: User;
  currentUserId: number;
  onSendMessage: (content: string) => void;
  loading?: boolean;
}

const ChatWindow = ({ messages, otherUser, currentUserId, onSendMessage, loading }: ChatWindowProps) => {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  const handleSend = () => {
    if (newMessage.trim() && !loading) {
      onSendMessage(newMessage);
      setNewMessage("");
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="hidden md:flex flex-col flex-1">
      {/* Chat Header */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center">
        <div className="relative mr-3">
          <Avatar>
            <AvatarImage src={otherUser.profilePicture} alt={otherUser.name} />
            <AvatarFallback>{otherUser.name.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-800"></div>
        </div>
        <div>
          <h4 className="font-medium text-sm">{otherUser.name}</h4>
          <p className="text-xs text-green-500">Online</p>
        </div>
        <div className="ml-auto flex space-x-2">
          <Button variant="ghost" size="icon" className="text-gray-500">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-500">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-500">
            <Info className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isSent={message.senderId === currentUserId}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Chat Input */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" className="text-gray-500">
            <Paperclip className="h-5 w-5" />
          </Button>
          <div className="flex-1 mx-2">
            <Input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full rounded-full"
              disabled={loading}
            />
          </div>
          <Button 
            size="icon" 
            className="rounded-full"
            onClick={handleSend}
            disabled={!newMessage.trim() || loading}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;

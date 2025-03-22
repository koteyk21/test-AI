import { User, Post, Message, Notification, PostWithAuthor, MessageWithUser, NotificationWithActor } from "@shared/schema";

export interface UserWithStats extends Omit<User, 'password'> {
  stats: {
    posts: number;
    followers: number;
    following: number;
  }
  isFollowing?: boolean;
}

export interface ConversationPreview {
  user: User;
  lastMessage: MessageWithUser;
  unreadCount: number;
}

export interface AIRecommendation {
  id: number;
  title: string;
  source: string;
  imageUrl: string;
  url: string;
}

export interface WebSocketMessage {
  type: 'message' | 'message_sent' | 'message_received' | 'notification';
  userId?: number;
  receiverId?: number;
  content?: string;
  message?: MessageWithUser;
  notification?: NotificationWithActor;
}

export interface UnreadCounts {
  notifications: number;
  messages: number;
}

export interface AuthContextType {
  user: UserWithStats | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

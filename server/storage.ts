import { 
  users, type User, type InsertUser,
  posts, type Post, type InsertPost,
  follows, type Follow, type InsertFollow,
  messages, type Message, type InsertMessage,
  notifications, type Notification, type InsertNotification,
  type PostWithAuthor, type MessageWithUser, type NotificationWithActor
} from "@shared/schema";

// Storage interface for all data operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getUserFollowers(userId: number): Promise<User[]>;
  getUserFollowing(userId: number): Promise<User[]>;
  getUserStats(userId: number): Promise<{ posts: number, followers: number, following: number }>;
  
  // Post operations
  createPost(post: InsertPost): Promise<Post>;
  getPost(id: number): Promise<Post | undefined>;
  getPosts(): Promise<PostWithAuthor[]>;
  getUserPosts(userId: number): Promise<Post[]>;
  likePost(postId: number): Promise<void>;
  getFeedForUser(userId: number): Promise<PostWithAuthor[]>;
  
  // Follow operations
  followUser(follow: InsertFollow): Promise<Follow>;
  unfollowUser(followerId: number, followingId: number): Promise<void>;
  isFollowing(followerId: number, followingId: number): Promise<boolean>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesForUsers(user1Id: number, user2Id: number): Promise<MessageWithUser[]>;
  getConversationsForUser(userId: number): Promise<{
    user: User,
    lastMessage: MessageWithUser,
    unreadCount: number
  }[]>;
  markMessageAsRead(messageId: number): Promise<void>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: number): Promise<NotificationWithActor[]>;
  markNotificationAsRead(notificationId: number): Promise<void>;
  getUnreadNotificationsCount(userId: number): Promise<number>;
  getUnreadMessagesCount(userId: number): Promise<number>;
}

// Import the PostgreSQL storage implementation
import { PgStorage } from './pgStorage';

// In-memory implementation of the storage interface
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private posts: Map<number, Post>;
  private follows: Map<number, Follow>;
  private messages: Map<number, Message>;
  private notifications: Map<number, Notification>;
  
  private currentUserId: number;
  private currentPostId: number;
  private currentFollowId: number;
  private currentMessageId: number;
  private currentNotificationId: number;

  constructor() {
    this.users = new Map();
    this.posts = new Map();
    this.follows = new Map();
    this.messages = new Map();
    this.notifications = new Map();
    
    this.currentUserId = 1;
    this.currentPostId = 1;
    this.currentFollowId = 1;
    this.currentMessageId = 1;
    this.currentNotificationId = 1;
    
    // Add some demo users
    this._seedDemoData();
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase()
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const createdAt = new Date().toISOString();
    const user: User = { ...userData, id, createdAt };
    this.users.set(id, user);
    return user;
  }
  
  async getUserFollowers(userId: number): Promise<User[]> {
    const followerIds = Array.from(this.follows.values())
      .filter(follow => follow.followingId === userId)
      .map(follow => follow.followerId);
    
    return followerIds.map(id => this.users.get(id)!).filter(Boolean);
  }
  
  async getUserFollowing(userId: number): Promise<User[]> {
    const followingIds = Array.from(this.follows.values())
      .filter(follow => follow.followerId === userId)
      .map(follow => follow.followingId);
    
    return followingIds.map(id => this.users.get(id)!).filter(Boolean);
  }
  
  async getUserStats(userId: number): Promise<{ posts: number, followers: number, following: number }> {
    const postsCount = Array.from(this.posts.values()).filter(post => post.userId === userId).length;
    const followersCount = Array.from(this.follows.values()).filter(follow => follow.followingId === userId).length;
    const followingCount = Array.from(this.follows.values()).filter(follow => follow.followerId === userId).length;
    
    return {
      posts: postsCount,
      followers: followersCount,
      following: followingCount
    };
  }
  
  // Post operations
  async createPost(postData: InsertPost): Promise<Post> {
    const id = this.currentPostId++;
    const createdAt = new Date().toISOString();
    const post: Post = { 
      ...postData, 
      id, 
      likes: 0, 
      comments: 0, 
      createdAt 
    };
    this.posts.set(id, post);
    return post;
  }
  
  async getPost(id: number): Promise<Post | undefined> {
    return this.posts.get(id);
  }
  
  async getPosts(): Promise<PostWithAuthor[]> {
    return Array.from(this.posts.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map(post => {
        const author = this.users.get(post.userId)!;
        return {
          ...post,
          author: {
            id: author.id,
            username: author.username,
            name: author.name,
            profilePicture: author.profilePicture
          }
        };
      });
  }
  
  async getUserPosts(userId: number): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter(post => post.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async likePost(postId: number): Promise<void> {
    const post = this.posts.get(postId);
    if (post) {
      post.likes += 1;
      this.posts.set(postId, post);
    }
  }
  
  async getFeedForUser(userId: number): Promise<PostWithAuthor[]> {
    // In a real app, this would be a more sophisticated algorithm
    // For now, just return all posts sorted by date
    return this.getPosts();
  }
  
  // Follow operations
  async followUser(followData: InsertFollow): Promise<Follow> {
    const id = this.currentFollowId++;
    const createdAt = new Date().toISOString();
    const follow: Follow = { ...followData, id, createdAt };
    this.follows.set(id, follow);
    return follow;
  }
  
  async unfollowUser(followerId: number, followingId: number): Promise<void> {
    const followToRemove = Array.from(this.follows.entries()).find(
      ([_, follow]) => follow.followerId === followerId && follow.followingId === followingId
    );
    
    if (followToRemove) {
      this.follows.delete(followToRemove[0]);
    }
  }
  
  async isFollowing(followerId: number, followingId: number): Promise<boolean> {
    return Array.from(this.follows.values()).some(
      follow => follow.followerId === followerId && follow.followingId === followingId
    );
  }
  
  // Message operations
  async createMessage(messageData: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const createdAt = new Date().toISOString();
    const message: Message = { ...messageData, id, read: false, createdAt };
    this.messages.set(id, message);
    return message;
  }
  
  async getMessagesForUsers(user1Id: number, user2Id: number): Promise<MessageWithUser[]> {
    return Array.from(this.messages.values())
      .filter(
        message => 
          (message.senderId === user1Id && message.receiverId === user2Id) ||
          (message.senderId === user2Id && message.receiverId === user1Id)
      )
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map(message => {
        const sender = this.users.get(message.senderId)!;
        return {
          ...message,
          sender: {
            id: sender.id,
            username: sender.username,
            name: sender.name,
            profilePicture: sender.profilePicture
          }
        };
      });
  }
  
  async getConversationsForUser(userId: number): Promise<{
    user: User,
    lastMessage: MessageWithUser,
    unreadCount: number
  }[]> {
    // Get all unique users this user has conversations with
    const messagesWithUser = Array.from(this.messages.values()).filter(
      message => message.senderId === userId || message.receiverId === userId
    );
    
    const conversationUserIds = new Set<number>();
    messagesWithUser.forEach(message => {
      const otherId = message.senderId === userId ? message.receiverId : message.senderId;
      conversationUserIds.add(otherId);
    });
    
    // Get the last message and unread count for each conversation
    return Array.from(conversationUserIds).map(otherUserId => {
      const user = this.users.get(otherUserId)!;
      const conversationMessages = messagesWithUser.filter(
        message => message.senderId === otherUserId || message.receiverId === otherUserId
      );
      
      const sortedMessages = [...conversationMessages].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      const lastMessage = sortedMessages[0];
      const sender = this.users.get(lastMessage.senderId)!;
      
      const unreadCount = conversationMessages.filter(
        message => message.receiverId === userId && !message.read
      ).length;
      
      return {
        user,
        lastMessage: {
          ...lastMessage,
          sender: {
            id: sender.id,
            username: sender.username,
            name: sender.name,
            profilePicture: sender.profilePicture
          }
        },
        unreadCount
      };
    }).sort((a, b) => {
      return new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime();
    });
  }
  
  async markMessageAsRead(messageId: number): Promise<void> {
    const message = this.messages.get(messageId);
    if (message) {
      message.read = true;
      this.messages.set(messageId, message);
    }
  }
  
  // Notification operations
  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const id = this.currentNotificationId++;
    const createdAt = new Date().toISOString();
    const notification: Notification = { ...notificationData, id, read: false, createdAt };
    this.notifications.set(id, notification);
    return notification;
  }
  
  async getUserNotifications(userId: number): Promise<NotificationWithActor[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map(notification => {
        const actor = this.users.get(notification.actorId)!;
        return {
          ...notification,
          actor: {
            id: actor.id,
            username: actor.username,
            name: actor.name,
            profilePicture: actor.profilePicture
          }
        };
      });
  }
  
  async markNotificationAsRead(notificationId: number): Promise<void> {
    const notification = this.notifications.get(notificationId);
    if (notification) {
      notification.read = true;
      this.notifications.set(notificationId, notification);
    }
  }
  
  async getUnreadNotificationsCount(userId: number): Promise<number> {
    return Array.from(this.notifications.values()).filter(
      notification => notification.userId === userId && !notification.read
    ).length;
  }
  
  async getUnreadMessagesCount(userId: number): Promise<number> {
    return Array.from(this.messages.values()).filter(
      message => message.receiverId === userId && !message.read
    ).length;
  }
  
  // Helper method to seed demo data
  private _seedDemoData(): void {
    // Add demo users
    const users: InsertUser[] = [
      {
        username: "alex",
        password: "password123",
        name: "Alexander Petrov",
        bio: "Software developer, coffee lover and traveler. Working on innovative AI projects.",
        profilePicture: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3"
      },
      {
        username: "maria",
        password: "password123",
        name: "Maria Ivanova",
        bio: "Photographer and nature enthusiast. Capturing beautiful moments.",
        profilePicture: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3"
      },
      {
        username: "ivan",
        password: "password123",
        name: "Ivan Smirnov",
        bio: "AI researcher and technology enthusiast.",
        profilePicture: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3"
      },
      {
        username: "anna",
        password: "password123",
        name: "Anna Sergeeva",
        bio: "UX/UI designer passionate about creating beautiful interfaces.",
        profilePicture: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3"
      }
    ];
    
    users.forEach(user => {
      const id = this.currentUserId++;
      const createdAt = new Date().toISOString();
      this.users.set(id, { ...user, id, createdAt });
    });
    
    // Add demo posts
    const posts: InsertPost[] = [
      {
        userId: 2, // Maria
        content: "Amazing view of the lake from our trip! Nature is incredible 😍 #travel #nature",
        mediaUrl: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?ixlib=rb-4.0.3"
      },
      {
        userId: 3, // Ivan
        content: "The new AI algorithm we've been working on is finally launched! It will increase prediction accuracy by 35%. #technology #AI #development",
        mediaUrl: ""
      },
      {
        userId: 4, // Anna
        content: "Can't stop working on this new project! What do you think about this design? #design #web #UX",
        mediaUrl: "https://images.unsplash.com/photo-1593642532973-d31b6557fa68?ixlib=rb-4.0.3"
      },
      {
        userId: 1, // Alex
        content: "Just finished working on a new feature for our app. Can't wait to share it with all of you!",
        mediaUrl: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3"
      },
      {
        userId: 1, // Alex
        content: "Exploring new technologies for our next big project. #coding #innovation",
        mediaUrl: "https://images.unsplash.com/photo-1545239351-cefa43af60f3?ixlib=rb-4.0.3"
      },
      {
        userId: 1, // Alex
        content: "Working on the UI for a client project. Modern and clean!",
        mediaUrl: "https://images.unsplash.com/photo-1593642532973-d31b6557fa68?ixlib=rb-4.0.3"
      }
    ];
    
    posts.forEach(post => {
      const id = this.currentPostId++;
      const createdAt = new Date().toISOString();
      this.posts.set(id, { 
        ...post, 
        id, 
        likes: Math.floor(Math.random() * 300), 
        comments: Math.floor(Math.random() * 50),
        createdAt
      });
    });
    
    // Add demo follows
    const follows: InsertFollow[] = [
      { followerId: 2, followingId: 1 }, // Maria follows Alex
      { followerId: 3, followingId: 1 }, // Ivan follows Alex
      { followerId: 4, followingId: 1 }, // Anna follows Alex
      { followerId: 1, followingId: 2 }, // Alex follows Maria
      { followerId: 1, followingId: 3 }, // Alex follows Ivan
    ];
    
    follows.forEach(follow => {
      const id = this.currentFollowId++;
      const createdAt = new Date().toISOString();
      this.follows.set(id, { ...follow, id, createdAt });
    });
    
    // Add demo messages
    const messages: InsertMessage[] = [
      { senderId: 2, receiverId: 1, content: "Hi! How's it going with that project?" },
      { senderId: 1, receiverId: 2, content: "Hey! All going according to plan, almost finished the interface design." },
      { senderId: 2, receiverId: 1, content: "Great! Can you show me what you've got so far?" },
      { senderId: 1, receiverId: 2, content: "Of course! Here's a screenshot of the main page:" },
      { senderId: 3, receiverId: 1, content: "Thanks for the information!" },
      { senderId: 4, receiverId: 1, content: "Sending you the materials we talked about" },
    ];
    
    // Add with decreasing timestamps to simulate conversation order
    let timeOffset = 0;
    messages.forEach(message => {
      const id = this.currentMessageId++;
      const date = new Date();
      date.setMinutes(date.getMinutes() - timeOffset);
      const createdAt = date.toISOString();
      timeOffset += 5; // 5 minutes between messages
      
      this.messages.set(id, { 
        ...message, 
        id, 
        read: message.senderId !== 1, // Messages to user 1 are unread
        createdAt 
      });
    });
    
    // Add demo notifications
    const notifications: InsertNotification[] = [
      { userId: 1, actorId: 2, type: "like", entityId: 4 }, // Maria liked Alex's post
      { userId: 1, actorId: 3, type: "comment", entityId: 4 }, // Ivan commented on Alex's post
      { userId: 1, actorId: 4, type: "follow", entityId: undefined }, // Anna followed Alex
    ];
    
    timeOffset = 0;
    notifications.forEach(notification => {
      const id = this.currentNotificationId++;
      const date = new Date();
      date.setMinutes(date.getMinutes() - timeOffset);
      const createdAt = date.toISOString();
      timeOffset += 30; // 30 minutes between notifications
      
      this.notifications.set(id, { 
        ...notification, 
        id, 
        read: false,
        createdAt 
      });
    });
  }
}

// Export the PostgreSQL storage instance instead of MemStorage
export const storage = new PgStorage();

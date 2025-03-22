import { IStorage } from './storage';
import { db } from './db';
import { eq, and, or, desc, sql } from 'drizzle-orm';
import {
  User, InsertUser, Post, InsertPost,
  Follow, InsertFollow, Message, InsertMessage,
  Notification, InsertNotification,
  users, posts, follows, messages, notifications,
  PostWithAuthor, MessageWithUser, NotificationWithActor
} from '@shared/schema';

export class PgStorage implements IStorage {
  constructor() {
    console.log('PostgreSQL storage initialized');
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }
  
  async createUser(user: InsertUser): Promise<User> {
    try {
      console.log("Creating user with data:", user);
      const result = await db.insert(users).values({
        username: user.username,
        password: user.password,
        name: user.name,
        bio: user.bio || "",
        profilePicture: user.profilePicture || ""
      }).returning();
      console.log("User created:", result[0]);
      return result[0];
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }
  
  async getUserFollowers(userId: number): Promise<User[]> {
    // Temporarily return empty array
    return [];
  }
  
  async getUserFollowing(userId: number): Promise<User[]> {
    // Temporarily return empty array
    return [];
  }
  
  async getUserStats(userId: number): Promise<{ posts: number, followers: number, following: number }> {
    // Temporarily return default stats
    return {
      posts: 0,
      followers: 0,
      following: 0
    };
  }
  
  // Post operations
  async createPost(post: InsertPost): Promise<Post> {
    const result = await db.insert(posts).values({
      userId: post.userId,
      content: post.content,
      mediaUrl: post.mediaUrl || null,
      likes: 0,
      comments: 0
    }).returning();
    return result[0];
  }
  
  async getPost(id: number): Promise<Post | undefined> {
    const result = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
    return result[0];
  }
  
  async getPosts(): Promise<PostWithAuthor[]> {
    // Temporarily return empty array
    return [];
  }
  
  async getUserPosts(userId: number): Promise<Post[]> {
    const result = await db
      .select()
      .from(posts)
      .where(eq(posts.userId, userId));
    
    return result;
  }
  
  async likePost(postId: number): Promise<void> {
    await db
      .update(posts)
      .set({ likes: sql`${posts.likes} + 1` })
      .where(eq(posts.id, postId));
  }
  
  async getFeedForUser(userId: number): Promise<PostWithAuthor[]> {
    // Temporarily return empty array
    return [];
  }
  
  // Follow operations
  async followUser(follow: InsertFollow): Promise<Follow> {
    const result = await db.insert(follows).values({
      followerId: follow.followerId,
      followingId: follow.followingId
    }).returning();
    return result[0];
  }
  
  async unfollowUser(followerId: number, followingId: number): Promise<void> {
    await db
      .delete(follows)
      .where(
        and(
          eq(follows.followerId, followerId),
          eq(follows.followingId, followingId)
        )
      );
  }
  
  async isFollowing(followerId: number, followingId: number): Promise<boolean> {
    const result = await db
      .select()
      .from(follows)
      .where(
        and(
          eq(follows.followerId, followerId),
          eq(follows.followingId, followingId)
        )
      )
      .limit(1);
    
    return result.length > 0;
  }
  
  // Message operations
  async createMessage(message: InsertMessage): Promise<Message> {
    const result = await db.insert(messages).values({
      senderId: message.senderId,
      receiverId: message.receiverId,
      content: message.content,
      read: false
    }).returning();
    return result[0];
  }
  
  async getMessagesForUsers(user1Id: number, user2Id: number): Promise<MessageWithUser[]> {
    // Temporarily return empty array
    return [];
  }
  
  async getConversationsForUser(userId: number): Promise<{
    user: User,
    lastMessage: MessageWithUser,
    unreadCount: number
  }[]> {
    // Temporarily return empty array
    return [];
  }
  
  async markMessageAsRead(messageId: number): Promise<void> {
    await db
      .update(messages)
      .set({ read: true })
      .where(eq(messages.id, messageId));
  }
  
  // Notification operations
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const result = await db.insert(notifications).values({
      userId: notification.userId,
      actorId: notification.actorId,
      type: notification.type,
      entityId: notification.entityId || null,
      read: false
    }).returning();
    return result[0];
  }
  
  async getUserNotifications(userId: number): Promise<NotificationWithActor[]> {
    // Temporarily return empty array
    return [];
  }
  
  async markNotificationAsRead(notificationId: number): Promise<void> {
    await db
      .update(notifications)
      .set({ read: true })
      .where(eq(notifications.id, notificationId));
  }
  
  async getUnreadNotificationsCount(userId: number): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          eq(notifications.read, false)
        )
      );
    
    return result[0]?.count || 0;
  }
  
  async getUnreadMessagesCount(userId: number): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(messages)
      .where(
        and(
          eq(messages.receiverId, userId),
          eq(messages.read, false)
        )
      );
    
    return result[0]?.count || 0;
  }
  
  // Seed demo data
  async seedDemoData(): Promise<void> {
    try {
      // Create demo users
      const user1 = await this.createUser({
        username: "johndoe",
        password: "password",
        name: "John Doe",
        bio: "Software developer and tech enthusiast",
        profilePicture: "https://randomuser.me/api/portraits/men/1.jpg"
      });
      
      const user2 = await this.createUser({
        username: "janedoe",
        password: "password",
        name: "Jane Doe",
        bio: "Digital artist and designer",
        profilePicture: "https://randomuser.me/api/portraits/women/1.jpg"
      });
      
      // Only add a couple of test records for now
      
      console.log("Demo data seeded successfully!");
    } catch (error) {
      console.error("Error seeding demo data:", error);
    }
  }
}
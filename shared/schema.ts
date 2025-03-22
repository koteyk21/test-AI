import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  bio: text("bio").default(""),
  profilePicture: text("profile_picture").default(""),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Posts Table
export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  mediaUrl: text("media_url"),
  likes: integer("likes").default(0).notNull(),
  comments: integer("comments").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  likes: true,
  comments: true,
  createdAt: true,
});

// Follows Table
export const follows = pgTable("follows", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id").notNull().references(() => users.id),
  followingId: integer("following_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertFollowSchema = createInsertSchema(follows).omit({
  id: true,
  createdAt: true,
});

// Messages Table
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull().references(() => users.id),
  receiverId: integer("receiver_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  read: true,
  createdAt: true,
});

// Notifications Table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  actorId: integer("actor_id").notNull().references(() => users.id),
  type: text("type").notNull(), // like, comment, follow
  entityId: integer("entity_id"), // post_id or comment_id
  read: boolean("read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  read: true,
  createdAt: true,
});

// Types for the schema
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;

export type Follow = typeof follows.$inferSelect;
export type InsertFollow = z.infer<typeof insertFollowSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;

// Extended types for frontend use
export const postWithAuthorSchema = z.object({
  id: z.number(),
  userId: z.number(),
  content: z.string(),
  mediaUrl: z.string().optional(),
  likes: z.number(),
  comments: z.number(),
  createdAt: z.string(),
  author: z.object({
    id: z.number(),
    username: z.string(),
    name: z.string(),
    profilePicture: z.string()
  })
});

export type PostWithAuthor = z.infer<typeof postWithAuthorSchema>;

export const messageWithUserSchema = z.object({
  id: z.number(),
  senderId: z.number(),
  receiverId: z.number(),
  content: z.string(),
  read: z.boolean(),
  createdAt: z.string(),
  sender: z.object({
    id: z.number(),
    username: z.string(),
    name: z.string(),
    profilePicture: z.string()
  })
});

export type MessageWithUser = z.infer<typeof messageWithUserSchema>;

export const notificationWithActorSchema = z.object({
  id: z.number(),
  userId: z.number(),
  actorId: z.number(),
  type: z.string(),
  entityId: z.number().optional(),
  read: z.boolean(),
  createdAt: z.string(),
  actor: z.object({
    id: z.number(),
    username: z.string(),
    name: z.string(),
    profilePicture: z.string()
  })
});

export type NotificationWithActor = z.infer<typeof notificationWithActorSchema>;

// Auth schemas
export const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

export type LoginCredentials = z.infer<typeof loginSchema>;

export const registerSchema = insertUserSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters")
});

export type RegisterData = z.infer<typeof registerSchema>;

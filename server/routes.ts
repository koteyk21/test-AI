import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { 
  loginSchema, registerSchema, insertPostSchema, insertFollowSchema, 
  insertMessageSchema, insertNotificationSchema 
} from "@shared/schema";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import MemoryStore from "memorystore";

// WebSocket clients by user ID
const clients = new Map<number, WebSocket>();

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Setup WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Setup session
  const MemoryStoreSession = MemoryStore(session);
  app.use(session({
    secret: process.env.SESSION_SECRET || 'social-hub-secret',
    resave: true, // Изменено на true для сохранения сессии при каждом запросе
    saveUninitialized: true, // Изменено на true для сохранения новых неинициализированных сессий
    cookie: { 
      secure: process.env.NODE_ENV === 'production', // Secure only in production
      maxAge: 1000 * 60 * 60 * 24 * 7,  // 7 дней вместо 1
      sameSite: 'lax',
      httpOnly: true,
      path: '/'
    },
    store: new MemoryStoreSession({
      checkPeriod: 86400000 // 24h
    })
  }));
  
  // Setup passport
  app.use(passport.initialize());
  app.use(passport.session());
  
  // Configure passport
  passport.use(new LocalStrategy(async (username, password, done) => {
    try {
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return done(null, false, { message: 'User not found' });
      }
      if (user.password !== password) { // In a real app, use bcrypt to hash passwords
        return done(null, false, { message: 'Invalid password' });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }));
  
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });
  
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
  
  // WebSocket connection handler
  wss.on('connection', (ws, req) => {
    // Authentication handling for WebSocket
    const sessionCookie = req.headers.cookie?.split(';')
      .find(cookie => cookie.trim().startsWith('connect.sid='));
    
    ws.on('message', async (message) => {
      try {
        const data = JSON.parse(message.toString());
        
        if (data.userId) {
          // Register client
          clients.set(data.userId, ws);
          console.log(`WebSocket client registered for user ${data.userId}`);
        }
        
        // Handle message events
        if (data.type === 'message' && data.content && data.receiverId) {
          const newMessage = await storage.createMessage({
            senderId: data.userId,
            receiverId: data.receiverId,
            content: data.content
          });
          
          // Get the complete message with user info
          const messages = await storage.getMessagesForUsers(data.userId, data.receiverId);
          const sentMessage = messages.find(m => m.id === newMessage.id);
          
          // Notify sender for confirmation
          ws.send(JSON.stringify({
            type: 'message_sent',
            message: sentMessage
          }));
          
          // Notify receiver if online
          const receiverWs = clients.get(data.receiverId);
          if (receiverWs && receiverWs.readyState === WebSocket.OPEN) {
            receiverWs.send(JSON.stringify({
              type: 'message_received',
              message: sentMessage
            }));
          }
          
          // Create notification for message
          await storage.createNotification({
            userId: data.receiverId,
            actorId: data.userId,
            type: 'message',
            entityId: newMessage.id
          });
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      // Remove client on disconnect
      for (const [userId, client] of clients.entries()) {
        if (client === ws) {
          clients.delete(userId);
          console.log(`WebSocket client unregistered for user ${userId}`);
          break;
        }
      }
    });
  });

  // Auth Routes
  app.post('/api/auth/login', (req, res, next) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      passport.authenticate('local', (err: any, user: any, info: any) => {
        if (err) return next(err);
        if (!user) {
          return res.status(401).json({ message: info.message || 'Authentication failed' });
        }
        
        req.logIn(user, (err) => {
          if (err) return next(err);
          
          console.log("Login successful, session ID:", req.sessionID);
          
          const { password, ...userWithoutPassword } = user;
          return res.json({ 
            user: userWithoutPassword,
            message: 'Login successful' 
          });
        });
      })(req, res, next);
    } catch (error) {
      res.status(400).json({ message: 'Invalid input data' });
    }
  });
  
  // Special endpoint to check if session is valid and refresh it
  app.get('/api/auth/session', (req, res) => {
    console.log("Session check:", {
      isAuthenticated: req.isAuthenticated(),
      sessionID: req.sessionID,
      hasSession: !!req.session,
      user: req.user ? (req.user as any).id : null,
      cookies: req.headers.cookie
    });
    
    if (req.isAuthenticated()) {
      const user = req.user as any;
      const { password, ...userWithoutPassword } = user;
      res.json({ 
        authenticated: true,
        user: userWithoutPassword
      });
    } else {
      res.status(401).json({ 
        authenticated: false,
        message: 'Not authenticated' 
      });
    }
  });
  
  app.post('/api/auth/register', async (req, res) => {
    try {
      console.log("Register request body:", req.body);
      const userData = registerSchema.parse(req.body);
      console.log("Parsed user data:", userData);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: 'Username already taken' });
      }
      
      const user = await storage.createUser(userData);
      const { password, ...userWithoutPassword } = user;
      
      req.login(user, (err) => {
        if (err) return res.status(500).json({ message: 'Login failed after registration' });
        return res.status(201).json({ 
          user: userWithoutPassword,
          message: 'Registration successful' 
        });
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(400).json({ message: 'Invalid input data', error: error instanceof Error ? error.message : String(error) });
    }
  });
  
  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) return res.status(500).json({ message: 'Logout failed' });
      res.json({ message: 'Logout successful' });
    });
  });
  
  // Auth check middleware
  const isAuthenticated = (req: Request, res: Response, next: any) => {
    console.log("Auth check:", {
      isAuthenticated: req.isAuthenticated(),
      sessionID: req.sessionID,
      hasSession: !!req.session,
      hasUser: !!req.user,
      cookies: req.headers.cookie
    });
    
    if (req.isAuthenticated()) {
      return next();
    }
    res.status(401).json({ message: 'Unauthorized' });
  };
  
  // User Routes
  app.get('/api/users/me', isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const stats = await storage.getUserStats(user.id);
    
    const { password, ...userWithoutPassword } = user;
    res.json({
      ...userWithoutPassword,
      stats
    });
  });
  
  app.get('/api/users/:id', isAuthenticated, async (req, res) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const stats = await storage.getUserStats(userId);
    const currentUser = req.user as any;
    const isFollowing = await storage.isFollowing(currentUser.id, userId);
    
    const { password, ...userWithoutPassword } = user;
    res.json({
      ...userWithoutPassword,
      stats,
      isFollowing
    });
  });
  
  // Post Routes
  app.post('/api/posts', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const postData = insertPostSchema.parse({
        ...req.body,
        userId: user.id
      });
      
      const post = await storage.createPost(postData);
      res.status(201).json(post);
    } catch (error) {
      res.status(400).json({ message: 'Invalid post data' });
    }
  });
  
  app.get('/api/posts', isAuthenticated, async (req, res) => {
    const posts = await storage.getPosts();
    res.json(posts);
  });
  
  app.get('/api/posts/feed', isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const feed = await storage.getFeedForUser(user.id);
    res.json(feed);
  });
  
  app.get('/api/users/:id/posts', isAuthenticated, async (req, res) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    const posts = await storage.getUserPosts(userId);
    res.json(posts);
  });
  
  app.post('/api/posts/:id/like', isAuthenticated, async (req, res) => {
    const postId = parseInt(req.params.id);
    if (isNaN(postId)) {
      return res.status(400).json({ message: 'Invalid post ID' });
    }
    
    const post = await storage.getPost(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    
    await storage.likePost(postId);
    
    // Create notification for post like
    const user = req.user as any;
    if (post.userId !== user.id) { // Don't notify for self-likes
      await storage.createNotification({
        userId: post.userId,
        actorId: user.id,
        type: 'like',
        entityId: postId
      });
      
      // Notify user if online
      const receiverWs = clients.get(post.userId);
      if (receiverWs && receiverWs.readyState === WebSocket.OPEN) {
        const notifications = await storage.getUserNotifications(post.userId);
        receiverWs.send(JSON.stringify({
          type: 'notification',
          notification: notifications[0] // Most recent notification
        }));
      }
    }
    
    res.json({ message: 'Post liked successfully' });
  });
  
  // Follow Routes
  app.post('/api/users/:id/follow', isAuthenticated, async (req, res) => {
    const followingId = parseInt(req.params.id);
    if (isNaN(followingId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    const user = req.user as any;
    
    if (user.id === followingId) {
      return res.status(400).json({ message: 'Cannot follow yourself' });
    }
    
    const followingUser = await storage.getUser(followingId);
    if (!followingUser) {
      return res.status(404).json({ message: 'User to follow not found' });
    }
    
    const isAlreadyFollowing = await storage.isFollowing(user.id, followingId);
    if (isAlreadyFollowing) {
      return res.status(400).json({ message: 'Already following this user' });
    }
    
    try {
      const followData = insertFollowSchema.parse({
        followerId: user.id,
        followingId
      });
      
      await storage.followUser(followData);
      
      // Create notification for follow
      await storage.createNotification({
        userId: followingId,
        actorId: user.id,
        type: 'follow'
      });
      
      // Notify user if online
      const receiverWs = clients.get(followingId);
      if (receiverWs && receiverWs.readyState === WebSocket.OPEN) {
        const notifications = await storage.getUserNotifications(followingId);
        receiverWs.send(JSON.stringify({
          type: 'notification',
          notification: notifications[0] // Most recent notification
        }));
      }
      
      res.json({ message: 'User followed successfully' });
    } catch (error) {
      res.status(400).json({ message: 'Invalid follow data' });
    }
  });
  
  app.post('/api/users/:id/unfollow', isAuthenticated, async (req, res) => {
    const followingId = parseInt(req.params.id);
    if (isNaN(followingId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    const user = req.user as any;
    
    const isFollowing = await storage.isFollowing(user.id, followingId);
    if (!isFollowing) {
      return res.status(400).json({ message: 'Not following this user' });
    }
    
    await storage.unfollowUser(user.id, followingId);
    res.json({ message: 'User unfollowed successfully' });
  });
  
  // Message Routes
  app.get('/api/messages/conversations', isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const conversations = await storage.getConversationsForUser(user.id);
    res.json(conversations);
  });
  
  app.get('/api/messages/:userId', isAuthenticated, async (req, res) => {
    const otherUserId = parseInt(req.params.userId);
    if (isNaN(otherUserId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    const user = req.user as any;
    const messages = await storage.getMessagesForUsers(user.id, otherUserId);
    
    // Mark messages as read
    for (const message of messages) {
      if (message.receiverId === user.id && !message.read) {
        await storage.markMessageAsRead(message.id);
      }
    }
    
    res.json(messages);
  });
  
  app.post('/api/messages/:userId', isAuthenticated, async (req, res) => {
    const receiverId = parseInt(req.params.userId);
    if (isNaN(receiverId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    
    const user = req.user as any;
    
    try {
      const messageData = insertMessageSchema.parse({
        senderId: user.id,
        receiverId,
        content: req.body.content
      });
      
      const message = await storage.createMessage(messageData);
      
      // Get the complete message with user info
      const messages = await storage.getMessagesForUsers(user.id, receiverId);
      const sentMessage = messages.find(m => m.id === message.id);
      
      // Create notification for message
      await storage.createNotification({
        userId: receiverId,
        actorId: user.id,
        type: 'message',
        entityId: message.id
      });
      
      // Notify receiver if online
      const receiverWs = clients.get(receiverId);
      if (receiverWs && receiverWs.readyState === WebSocket.OPEN) {
        receiverWs.send(JSON.stringify({
          type: 'message_received',
          message: sentMessage
        }));
      }
      
      res.status(201).json(sentMessage);
    } catch (error) {
      res.status(400).json({ message: 'Invalid message data' });
    }
  });
  
  app.post('/api/messages/:id/read', isAuthenticated, async (req, res) => {
    const messageId = parseInt(req.params.id);
    if (isNaN(messageId)) {
      return res.status(400).json({ message: 'Invalid message ID' });
    }
    
    await storage.markMessageAsRead(messageId);
    res.json({ message: 'Message marked as read' });
  });
  
  // Notification Routes
  app.get('/api/notifications', isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const notifications = await storage.getUserNotifications(user.id);
    res.json(notifications);
  });
  
  app.post('/api/notifications/:id/read', isAuthenticated, async (req, res) => {
    const notificationId = parseInt(req.params.id);
    if (isNaN(notificationId)) {
      return res.status(400).json({ message: 'Invalid notification ID' });
    }
    
    await storage.markNotificationAsRead(notificationId);
    res.json({ message: 'Notification marked as read' });
  });
  
  app.get('/api/notifications/unread-count', isAuthenticated, async (req, res) => {
    const user = req.user as any;
    const notificationsCount = await storage.getUnreadNotificationsCount(user.id);
    const messagesCount = await storage.getUnreadMessagesCount(user.id);
    
    res.json({
      notifications: notificationsCount,
      messages: messagesCount
    });
  });
  
  return httpServer;
}

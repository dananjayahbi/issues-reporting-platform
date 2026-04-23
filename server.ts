import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server as SocketIOServer, Socket } from "socket.io";
import { verifyToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/db/prisma";
import cron from "node-cron";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Socket.io namespaces
const chatNamespace = "/chat";
const notificationsNamespace = "/notifications";
const presenceNamespace = "/presence";

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

async function startServer() {
  await app.prepare();

  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling request:", err);
      res.statusCode = 500;
      res.end("Internal server error");
    }
  });

  const io = new SocketIOServer(httpServer, {
    path: "/api/socketio",
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
    transports: ["websocket", "polling"],
  });

  // Authentication middleware for Socket.io
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(" ")[1];

      if (!token) {
        return next(new Error("Authentication required"));
      }

      const payload = await verifyToken(token);
      if (!payload) {
        return next(new Error("Invalid or expired token"));
      }

      socket.userId = payload.userId;
      socket.userRole = payload.role;
      next();
    } catch (error) {
      console.error("Socket auth error:", error);
      next(new Error("Authentication failed"));
    }
  });

  // Chat namespace
  const chatIo = io.of(chatNamespace);
  chatIo.on("connection", (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;
    console.log(`Chat user connected: ${userId}`);

    // Join user's personal room for DMs
    socket.join(`user:${userId}`);

    // Join channel rooms
    socket.on("join:channel", async (channelId: string) => {
      try {
        // Verify user has access to channel
        const membership = await prisma.channelMember.findFirst({
          where: { channelId, userId },
        });

        if (membership) {
          socket.join(`channel:${channelId}`);
          console.log(`User ${userId} joined channel ${channelId}`);

          // Notify others
          socket.to(`channel:${channelId}`).emit("user:joined", {
            channelId,
            userId,
            timestamp: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error("Join channel error:", error);
      }
    });

    socket.on("leave:channel", (channelId: string) => {
      socket.leave(`channel:${channelId}`);
      socket.to(`channel:${channelId}`).emit("user:left", {
        channelId,
        userId,
        timestamp: new Date().toISOString(),
      });
    });

    // Typing indicators
    socket.on("typing:start", (channelId: string) => {
      socket.to(`channel:${channelId}`).emit("user:typing", {
        channelId,
        userId,
        isTyping: true,
      });
    });

    socket.on("typing:stop", (channelId: string) => {
      socket.to(`channel:${channelId}`).emit("user:typing", {
        channelId,
        userId,
        isTyping: false,
      });
    });

    // Send message
    socket.on("message:send", async (data: { channelId: string; body: string; replyToId?: string }) => {
      try {
        const { channelId, body, replyToId } = data;

        // Verify membership
        const membership = await prisma.channelMember.findFirst({
          where: { channelId, userId },
        });

        if (!membership) return;

        // Create message in database
        const message = await prisma.message.create({
          data: {
            channelId,
            body,
            authorId: userId,
            replyToId: replyToId ?? null,
          },
          include: {
            author: {
              select: { id: true, name: true, avatar: true },
            },
          },
        });

        // Broadcast to channel
        chatIo.to(`channel:${channelId}`).emit("message:new", message);

        // Update unread counts for offline members
        const members = await prisma.channelMember.findMany({
          where: { channelId },
          select: { userId: true },
        });

        for (const member of members) {
          if (member.userId !== userId) {
            chatIo.to(`user:${member.userId}`).emit("unread:increment", {
              channelId,
              count: 1,
            });
          }
        }
      } catch (error) {
        console.error("Send message error:", error);
        socket.emit("message:error", { error: "Failed to send message" });
      }
    });

    // Reactions
    socket.on("reaction:add", async (data: { messageId: string; emoji: string }) => {
      try {
        const { messageId, emoji } = data;

        const existing = await prisma.messageReaction.findFirst({
          where: { messageId, userId, emoji },
        });

        if (existing) return;

        await prisma.messageReaction.create({
          data: { messageId, userId, emoji },
        });

        const message = await prisma.message.findUnique({
          where: { id: messageId },
          select: { channelId: true },
        });

        if (message) {
          chatIo.to(`channel:${message.channelId}`).emit("reaction:added", {
            messageId,
            emoji,
            userId,
          });
        }
      } catch (error) {
        console.error("Add reaction error:", error);
      }
    });

    socket.on("reaction:remove", async (data: { messageId: string; emoji: string }) => {
      try {
        const { messageId, emoji } = data;

        await prisma.messageReaction.deleteMany({
          where: { messageId, userId, emoji },
        });

        const message = await prisma.message.findUnique({
          where: { id: messageId },
          select: { channelId: true },
        });

        if (message) {
          chatIo.to(`channel:${message.channelId}`).emit("reaction:removed", {
            messageId,
            emoji,
            userId,
          });
        }
      } catch (error) {
        console.error("Remove reaction error:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log(`Chat user disconnected: ${userId}`);
    });
  });

  // Notifications namespace
  const notifIo = io.of(notificationsNamespace);
  notifIo.on("connection", (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;
    console.log(`Notifications user connected: ${userId}`);

    // Join user's personal notification room
    socket.join(`user:${userId}`);

    socket.on("disconnect", () => {
      console.log(`Notifications user disconnected: ${userId}`);
    });
  });

  // Presence namespace
  const presenceIo = io.of(presenceNamespace);
  const onlineUsers = new Map<string, string>(); // userId -> socketId

  presenceIo.on("connection", (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;
    console.log(`Presence user connected: ${userId}`);

    // Mark user online
    onlineUsers.set(userId, socket.id);

    // Broadcast to all users that this user is online
    presenceIo.emit("user:online", { userId, timestamp: new Date().toISOString() });

    // Send current online users to the newly connected user
    socket.emit("presence:sync", {
      users: Array.from(onlineUsers.keys()),
      timestamp: new Date().toISOString(),
    });

    // Heartbeat to stay online
    socket.on("heartbeat", () => {
      onlineUsers.set(userId, socket.id);
    });

    // Direct presence check
    socket.on("presence:check", (targetUserId: string, callback) => {
      callback({ isOnline: onlineUsers.has(targetUserId) });
    });

    socket.on("disconnect", () => {
      console.log(`Presence user disconnected: ${userId}`);
      onlineUsers.delete(userId);

      // Broadcast offline after a grace period
      setTimeout(() => {
        if (!onlineUsers.has(userId)) {
          presenceIo.emit("user:offline", { userId, timestamp: new Date().toISOString() });
        }
      }, 5000); // 5 second grace period
    });
  });

  // Poll expiry checker - runs every minute
  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date();

      // Find expired polls that haven't been closed
      const expiredPolls = await prisma.poll.findMany({
        where: {
          expiresAt: { lte: now },
          closedAt: null,
        },
        select: { id: true, question: true, createdById: true },
      });

      for (const poll of expiredPolls) {
        // Close the poll
        await prisma.poll.update({
          where: { id: poll.id },
          data: { closedAt: now },
        });

        // Notify poll creator
        notifIo.to(`user:${poll.createdById}`).emit("poll:expired", {
          pollId: poll.id,
          question: poll.question,
          timestamp: now.toISOString(),
        });

        // If poll is attached to an issue, notify assignees
        const pollWithIssue = await prisma.poll.findUnique({
          where: { id: poll.id },
          select: { issueId: true, channelId: true },
        });

        if (pollWithIssue?.issueId) {
          const issue = await prisma.issue.findUnique({
            where: { id: pollWithIssue.issueId },
            select: { assignees: { select: { userId: true } } },
          });

          if (issue) {
            for (const assignee of issue.assignees) {
              notifIo.to(`user:${assignee.userId}`).emit("poll:expired", {
                pollId: poll.id,
                question: poll.question,
                issueId: pollWithIssue.issueId,
                timestamp: now.toISOString(),
              });
            }
          }
        }
      }
    } catch (error) {
      console.error("Poll expiry checker error:", error);
    }
  });

  // Start the server
  httpServer.listen(port, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   LLC-Lanka Issue Tracker Platform                           ║
║   Server running on http://${hostname}:${port}                    ║
║                                                               ║
║   Socket.io Namespaces:                                       ║
║   - ${chatNamespace} (Chat messaging)                            ║
║   - ${notificationsNamespace} (Real-time notifications)          ║
║   - ${presenceNamespace} (Online/offline presence)              ║
║                                                               ║
║   Environment: ${dev ? "development" : "production"}                            ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
    `);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

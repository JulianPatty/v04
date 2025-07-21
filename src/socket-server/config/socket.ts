import { Server as HTTPServer } from 'http'
import { Server as SocketIOServer, ServerOptions } from 'socket.io'
import { createAdapter } from '@socket.io/redis-adapter'
import { createClient } from 'redis'

// Socket.IO server configuration
export const socketConfig: Partial<ServerOptions> = {
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 45000,
  maxHttpBufferSize: 1e6, // 1MB
  allowEIO3: true, // Allow Socket.IO v3 clients
}

// Redis configuration for scaling (optional)
export const createRedisAdapter = async () => {
  if (!process.env.REDIS_URL) {
    return null
  }

  try {
    const pubClient = createClient({ url: process.env.REDIS_URL })
    const subClient = pubClient.duplicate()

    await Promise.all([pubClient.connect(), subClient.connect()])

    return createAdapter(pubClient, subClient)
  } catch (error) {
    console.error('Failed to create Redis adapter:', error)
    return null
  }
}

// Initialize Socket.IO server
export const initializeSocketServer = async (httpServer: HTTPServer) => {
  const io = new SocketIOServer(httpServer, socketConfig)

  // Set up Redis adapter for horizontal scaling (if available)
  const redisAdapter = await createRedisAdapter()
  if (redisAdapter) {
    io.adapter(redisAdapter)
    console.log('Socket.IO using Redis adapter for scaling')
  }

  // Middleware for authentication
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token
      const sessionId = socket.handshake.auth.sessionId

      // Add your authentication logic here
      // For example, verify JWT token or session
      if (!token && !sessionId) {
        return next(new Error('Authentication required'))
      }

      // Attach user data to socket
      socket.data.userId = socket.handshake.auth.userId
      socket.data.sessionId = sessionId

      next()
    } catch (error) {
      next(new Error('Authentication failed'))
    }
  })

  return io
}

// Socket event handlers configuration
export const socketEvents = {
  // Connection events
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  ERROR: 'error',

  // Room events
  JOIN_ROOM: 'join:room',
  LEAVE_ROOM: 'leave:room',
  ROOM_MESSAGE: 'room:message',

  // Workflow events
  WORKFLOW_UPDATE: 'workflow:update',
  WORKFLOW_SYNC: 'workflow:sync',
  WORKFLOW_LOCK: 'workflow:lock',
  WORKFLOW_UNLOCK: 'workflow:unlock',

  // Collaboration events
  CURSOR_MOVE: 'cursor:move',
  SELECTION_CHANGE: 'selection:change',
  USER_PRESENCE: 'user:presence',

  // Real-time notifications
  NOTIFICATION: 'notification',
  ALERT: 'alert',
} as const

// Room naming conventions
export const getRoomName = {
  workflow: (workflowId: string) => `workflow:${workflowId}`,
  user: (userId: string) => `user:${userId}`,
  organization: (orgId: string) => `org:${orgId}`,
  global: () => 'global',
}

// Socket.IO namespaces configuration
export const namespaces = {
  default: '/',
  workflows: '/workflows',
  notifications: '/notifications',
  admin: '/admin',
} as const

// Rate limiting configuration
export const rateLimits = {
  // Max events per minute per socket
  messagesPerMinute: 100,
  // Max join room requests per minute
  joinRoomPerMinute: 10,
  // Max workflow updates per minute
  workflowUpdatesPerMinute: 30,
}

// Export types for use in handlers
export type SocketEvent = typeof socketEvents[keyof typeof socketEvents]
export type SocketNamespace = typeof namespaces[keyof typeof namespaces]
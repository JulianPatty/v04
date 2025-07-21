import { Socket } from 'socket.io'
import { createClient } from '@/lib/supabase/server'
import { createLogger } from '@/lib/logs/console-logger'
import { nanoid } from 'nanoid'
import { ExtendedError } from 'socket.io/dist/namespace'

const logger = createLogger('SocketAuth')

// Extend Socket interface to include user data
declare module 'socket.io' {
  interface Socket {
    userId: string
    sessionId: string
    email?: string
    role?: string
    organizationId?: string
    workspaceId?: string
    permissions?: string[]
  }
}

// One-time token store (use Redis in production)
const oneTimeTokens = new Map<string, { userId: string; expiresAt: Date }>()

// Token expiry time (5 minutes)
const TOKEN_EXPIRY_MS = 5 * 60 * 1000

// Generate one-time token
export async function generateOneTimeToken(userId: string): Promise<string> {
  const token = nanoid(32)
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_MS)
  
  oneTimeTokens.set(token, { userId, expiresAt })
  
  // Clean up expired tokens periodically
  cleanupExpiredTokens()
  
  logger.info('Generated one-time token', { userId, expiresAt })
  return token
}

// Validate one-time token
function validateOneTimeToken(token: string): { userId: string } | null {
  const tokenData = oneTimeTokens.get(token)
  
  if (!tokenData) {
    logger.warn('Invalid one-time token attempted', { token })
    return null
  }
  
  if (tokenData.expiresAt < new Date()) {
    logger.warn('Expired one-time token attempted', { token })
    oneTimeTokens.delete(token)
    return null
  }
  
  // Token is valid, remove it (one-time use)
  oneTimeTokens.delete(token)
  logger.info('One-time token validated and consumed', { userId: tokenData.userId })
  
  return { userId: tokenData.userId }
}

// Clean up expired tokens
function cleanupExpiredTokens() {
  const now = new Date()
  for (const [token, data] of oneTimeTokens.entries()) {
    if (data.expiresAt < now) {
      oneTimeTokens.delete(token)
    }
  }
}

// Enhanced authentication middleware
export async function authenticateSocket(
  socket: Socket,
  next: (err?: ExtendedError) => void
) {
  try {
    logger.debug('Authenticating socket connection', { 
      socketId: socket.id,
      handshake: socket.handshake.auth 
    })

    // Extract authentication data from socket handshake
    const { 
      token,           // JWT or session token
      oneTimeToken,    // One-time token for secure connections
      sessionId,       // Session ID
      userId,          // Direct user ID (for trusted connections)
    } = socket.handshake.auth

    let authenticatedUserId: string | null = null
    let userEmail: string | undefined
    let userRole: string | undefined

    // Priority 1: Validate one-time token
    if (oneTimeToken) {
      const tokenData = validateOneTimeToken(oneTimeToken)
      if (tokenData) {
        authenticatedUserId = tokenData.userId
        logger.info('Authenticated via one-time token', { userId: authenticatedUserId })
      }
    }

    // Priority 2: Validate Supabase JWT token
    if (!authenticatedUserId && token) {
      try {
        const supabase = await createClient()
        const { data: { user }, error } = await supabase.auth.getUser(token)
        
        if (!error && user) {
          authenticatedUserId = user.id
          userEmail = user.email
          userRole = user.role
          logger.info('Authenticated via Supabase token', { 
            userId: authenticatedUserId,
            email: userEmail 
          })
        } else {
          logger.warn('Invalid Supabase token', { error })
        }
      } catch (error) {
        logger.error('Supabase authentication error', error as Error)
      }
    }

    // Priority 3: Validate session (implement your session logic)
    if (!authenticatedUserId && sessionId) {
      // TODO: Implement session validation
      // Example: Check session in database or cache
      // authenticatedUserId = await validateSession(sessionId)
      logger.debug('Session authentication not implemented', { sessionId })
    }

    // Priority 4: Trust direct userId (only for internal/trusted connections)
    if (!authenticatedUserId && userId && process.env.NODE_ENV === 'development') {
      authenticatedUserId = userId
      logger.warn('Using direct userId (development only)', { userId })
    }

    // Authentication failed
    if (!authenticatedUserId) {
      logger.error('Socket authentication failed', { 
        socketId: socket.id,
        auth: socket.handshake.auth 
      })
      return next(new Error('Authentication required'))
    }

    // Store user info in socket for later use
    socket.userId = authenticatedUserId
    socket.sessionId = sessionId || nanoid()
    socket.email = userEmail
    socket.role = userRole

    // Join user-specific room
    socket.join(`user:${authenticatedUserId}`)

    // Load additional user data if needed
    try {
      // Example: Load user permissions, organization, etc.
      // const userData = await loadUserData(authenticatedUserId)
      // socket.organizationId = userData.organizationId
      // socket.workspaceId = userData.workspaceId
      // socket.permissions = userData.permissions
    } catch (error) {
      logger.error('Failed to load user data', error as Error, { userId: authenticatedUserId })
    }

    logger.info('Socket authenticated successfully', {
      socketId: socket.id,
      userId: authenticatedUserId,
      sessionId: socket.sessionId,
      email: userEmail,
      role: userRole
    })

    next()
  } catch (error) {
    logger.error('Socket authentication error', error as Error, {
      socketId: socket.id
    })
    next(new Error('Authentication failed'))
  }
}

// Helper middleware to ensure authentication
export function requireAuth(socket: Socket, next: (err?: Error) => void) {
  if (!socket.userId) {
    return next(new Error('Not authenticated'))
  }
  next()
}

// Helper middleware to check permissions
export function requirePermission(permission: string) {
  return (socket: Socket, next: (err?: Error) => void) => {
    if (!socket.permissions?.includes(permission)) {
      logger.warn('Permission denied', {
        userId: socket.userId,
        permission,
        userPermissions: socket.permissions
      })
      return next(new Error('Permission denied'))
    }
    next()
  }
}

// Helper middleware to check role
export function requireRole(role: string) {
  return (socket: Socket, next: (err?: Error) => void) => {
    if (socket.role !== role) {
      logger.warn('Role requirement not met', {
        userId: socket.userId,
        requiredRole: role,
        userRole: socket.role
      })
      return next(new Error('Insufficient role'))
    }
    next()
  }
}

// Cleanup interval for expired tokens (every 5 minutes)
setInterval(cleanupExpiredTokens, 5 * 60 * 1000)

// Export authentication utilities
export const socketAuth = {
  authenticate: authenticateSocket,
  generateOneTimeToken,
  requireAuth,
  requirePermission,
  requireRole,
}
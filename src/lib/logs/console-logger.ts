type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  data?: any
  context?: string
  error?: Error
}

interface LoggerConfig {
  enabled: boolean
  minLevel: LogLevel
  showTimestamp: boolean
  showContext: boolean
  colorize: boolean
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

const LOG_COLORS = {
  debug: '\x1b[36m', // Cyan
  info: '\x1b[32m',  // Green
  warn: '\x1b[33m',  // Yellow
  error: '\x1b[31m', // Red
  reset: '\x1b[0m',  // Reset
}

class ConsoleLogger {
  private config: LoggerConfig
  private context?: string

  constructor(config?: Partial<LoggerConfig>, context?: string) {
    this.config = {
      enabled: process.env.NODE_ENV !== 'production',
      minLevel: (process.env.LOG_LEVEL as LogLevel) || 'info',
      showTimestamp: true,
      showContext: true,
      colorize: process.env.NODE_ENV !== 'production',
      ...config,
    }
    this.context = context
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.minLevel]
  }

  private formatTimestamp(): string {
    return new Date().toISOString()
  }

  private formatMessage(entry: LogEntry): string {
    let message = ''

    // Add timestamp
    if (this.config.showTimestamp) {
      message += `[${entry.timestamp}] `
    }

    // Add level with color
    if (this.config.colorize) {
      message += `${LOG_COLORS[entry.level]}[${entry.level.toUpperCase()}]${LOG_COLORS.reset} `
    } else {
      message += `[${entry.level.toUpperCase()}] `
    }

    // Add context
    if (this.config.showContext && (entry.context || this.context)) {
      message += `[${entry.context || this.context}] `
    }

    // Add main message
    message += entry.message

    return message
  }

  private log(level: LogLevel, message: string, data?: any, error?: Error) {
    if (!this.shouldLog(level)) return

    const entry: LogEntry = {
      timestamp: this.formatTimestamp(),
      level,
      message,
      data,
      context: this.context,
      error,
    }

    const formattedMessage = this.formatMessage(entry)

    // Log to console based on level
    switch (level) {
      case 'debug':
        console.debug(formattedMessage, data || '')
        break
      case 'info':
        console.info(formattedMessage, data || '')
        break
      case 'warn':
        console.warn(formattedMessage, data || '')
        break
      case 'error':
        console.error(formattedMessage, data || '', error || '')
        break
    }

    // Also log raw entry for structured logging systems
    if (process.env.STRUCTURED_LOGS === 'true') {
      console.log(JSON.stringify(entry))
    }
  }

  debug(message: string, data?: any) {
    this.log('debug', message, data)
  }

  info(message: string, data?: any) {
    this.log('info', message, data)
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data)
  }

  error(message: string, error?: Error | any, data?: any) {
    if (error instanceof Error) {
      this.log('error', message, data, error)
    } else {
      this.log('error', message, { ...data, error })
    }
  }

  // Create a child logger with additional context
  child(context: string): ConsoleLogger {
    const childContext = this.context ? `${this.context}:${context}` : context
    return new ConsoleLogger(this.config, childContext)
  }

  // Update configuration
  setConfig(config: Partial<LoggerConfig>) {
    this.config = { ...this.config, ...config }
  }

  // Enable/disable logger
  enable() {
    this.config.enabled = true
  }

  disable() {
    this.config.enabled = false
  }
}

// Create singleton instance
const logger = new ConsoleLogger()

// Export factory function for creating contextual loggers
export function createLogger(context?: string, config?: Partial<LoggerConfig>): ConsoleLogger {
  return new ConsoleLogger(config, context)
}

// Export default logger instance
export default logger

// Export types
export type { LogLevel, LogEntry, LoggerConfig }

// Utility functions
export const loggers = {
  // Pre-configured loggers for common contexts
  socket: createLogger('Socket'),
  database: createLogger('Database'),
  auth: createLogger('Auth'),
  api: createLogger('API'),
  workflow: createLogger('Workflow'),
  
  // Performance logging
  performance: {
    start(label: string): () => void {
      const startTime = performance.now()
      return () => {
        const duration = performance.now() - startTime
        logger.debug(`${label} completed`, { duration: `${duration.toFixed(2)}ms` })
      }
    },
    
    async measure<T>(label: string, fn: () => Promise<T>): Promise<T> {
      const startTime = performance.now()
      try {
        const result = await fn()
        const duration = performance.now() - startTime
        logger.debug(`${label} completed`, { duration: `${duration.toFixed(2)}ms` })
        return result
      } catch (error) {
        const duration = performance.now() - startTime
        logger.error(`${label} failed`, error as Error, { duration: `${duration.toFixed(2)}ms` })
        throw error
      }
    },
  },
}

// Development helpers
if (process.env.NODE_ENV !== 'production') {
  // @ts-ignore - Add to global for easy console access in development
  global.logger = logger
  // @ts-ignore
  global.loggers = loggers
}
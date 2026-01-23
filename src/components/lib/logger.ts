import pino from 'pino'

/**
 * Global logger instance using Pino
 * Production: JSON structured logs (for log aggregation services)
 * Development: Pretty-printed output for readability
 */
const logLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug')

export const logger = pino({
	level: logLevel,
	...(process.env.NODE_ENV === 'production' && {
		transport: undefined,
	}),
	...(process.env.NODE_ENV !== 'production' && {
		transport: {
			target: 'pino-pretty',
			options: {
				colorize: true,
				singleLine: false,
				translateTime: 'SYS:standard',
				ignore: 'pid,hostname',
			},
		},
	}),
})

export default logger

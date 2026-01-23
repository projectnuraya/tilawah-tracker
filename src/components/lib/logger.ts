import pino from 'pino'

const logLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug')

export const logger = pino({
	level: logLevel,
	...(process.env.NODE_ENV === 'production' && {
		// Production: structured JSON logs
		transport: undefined,
	}),
	...(process.env.NODE_ENV !== 'production' && {
		// Development: pretty-printed logs for readability
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

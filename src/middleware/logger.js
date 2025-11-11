import pino from "pino-http";

const isProd = process.env.NODE_ENV === "production";

export const logger =
  pino({
    level: 'info',
    transport: isProd
    ? undefined
    :
      {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname',
        messageFormat: '{req.method} {req.url} {res.statusCode} - {responseTime}ms',
        hideObject: true,
      },
    },
  });


export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3001,
  dbUrl: process.env.MONGODB_URI || 'postgresql://localhost:5432/myapp',
  jtwExpiredIn: process.env.JWT_EXPIREDIN || '24h',
  jwtSecret: process.env.JWT_SECRET || 'mysecret',
  host: process.env.HOST || '127.0.0.1',
  microService: {
    host: process.env.AUTH_SERVICE_HOST || 'auth-service',
    port: Number(process.env.AUTH_SERVICE_PORT) || 4000,
  },
};

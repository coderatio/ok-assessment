export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3002,
  dbUrl: process.env.MONGODB_URI || 'mongodb://mongodb:2017/main_db',
  host: process.env.HOST || '127.0.0.1',
  microService: {
    host: 'payment-service',
    port: process.env.SERVICE_PORT || 8877,
  },
  authService: {
    host: process.env.AUTH_SERVICE_HOST || 'auth-service',
    port: parseInt(process.env.AUTH_SERVICE_PORT || '4000'),
  },
};

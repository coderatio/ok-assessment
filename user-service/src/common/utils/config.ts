export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  host: process.env.HOST || '127.0.0.1',
  dbUrl: process.env.MONGODB_URI || 'mongodb://mongodb:27017/main_db',
  microServiceOptions: {
    host: process.env.SERVICE_HOST || 'user-service',
    port: Number(process.env.SERVICE_PORT) || 4001,
  },
  paymentService: {
    host: process.env.PAYMENT_SERVICE_HOST || 'payment-service',
    port: parseInt(process.env.PAYMENT_SERVICE_PORT || '8877'),
  },
  authService: {
    host: process.env.AUTH_SERVICE_HOST || 'auth-service',
    port: parseInt(process.env.AUTH_SERVICE_PORT || '4000'),
  },
};

export const jwtConstants = {
  secret: process.env.JWT_SECRET || 'mysecret',
  expiredIn: process.env.JWT_EXPIREDIN || '24h',
};

export const AUTH_SERVICE = 'AUTH_SERVICE';
export const PAYMENT_SERVICE = 'PAYMENT_SERVICE';
export const SUPPORTED_CURRENCIES = ['NGN', 'USD'];

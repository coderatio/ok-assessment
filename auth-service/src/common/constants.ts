export const jwtConstants = {
  secret: process.env.JWT_SECRET || 'mysecret',
  expiredIn: process.env.JWT_EXPIREDIN || '24h',
};

export const USER_SERVICE = 'USER_SERVICE';

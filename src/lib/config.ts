// Environment configuration
export const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  
  // Database configuration
  database: {
    url: process.env.DATABASE_URL || '',
  },

  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'your-jwt-secret-here',
    expiresIn: '7d',
  },

  // API configuration
  api: {
    baseUrl: process.env.API_URL || 'http://localhost:3000/api',
    version: 'v1',
  },

  // CORS configuration
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  },
} as const;

export default config;

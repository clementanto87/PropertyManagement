import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT || 3000),
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d'
};

// Validate required environment variables
if (process.env.NODE_ENV === 'production') {
  if (!config.googleClientId) {
    console.warn('⚠️  WARNING: GOOGLE_CLIENT_ID is not set');
  }
  if (config.jwtSecret === 'your-secret-key-change-in-production') {
    console.warn('⚠️  WARNING: JWT_SECRET is using default value. Change it in production!');
  }
}

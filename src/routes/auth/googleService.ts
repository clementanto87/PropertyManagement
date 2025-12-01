import { OAuth2Client } from 'google-auth-library';
import { prisma } from '../../db/prisma';
import { generateToken } from '../../utils/jwt';
import { logger } from '../../utils/logger';
import { config } from '../../config/env';

const GOOGLE_CLIENT_ID = config.googleClientId;

if (!GOOGLE_CLIENT_ID) {
  logger.warn('GOOGLE_CLIENT_ID is not set in environment variables. Google OAuth will not work.');
}

const client = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

export interface GoogleTokenPayload {
  email: string;
  name: string;
  picture?: string;
  sub: string; // Google user ID
}

export async function verifyGoogleToken(idToken: string): Promise<GoogleTokenPayload> {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error('Google OAuth is not configured. GOOGLE_CLIENT_ID is missing in environment variables.');
  }

  if (!client) {
    throw new Error('Google OAuth client is not initialized. Check GOOGLE_CLIENT_ID configuration.');
  }

  if (!idToken || idToken.length < 100) {
    throw new Error('Invalid Google ID token format. Token appears to be malformed.');
  }

  try {
    logger.info({
      clientIdLength: GOOGLE_CLIENT_ID.length,
      clientIdPrefix: GOOGLE_CLIENT_ID.substring(0, 30) + '...',
      tokenLength: idToken.length
    }, 'Verifying Google token');

    const ticket = await client.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error('Invalid Google token - no payload received after verification');
    }

    if (!payload.email) {
      throw new Error('Google token does not contain email. Make sure you requested email scope.');
    }

    logger.info({ email: payload.email, name: payload.name }, 'Google token verified successfully');

    return {
      email: payload.email,
      name: payload.name || payload.email.split('@')[0],
      picture: payload.picture,
      sub: payload.sub
    };
  } catch (error) {
    logger.error({
      error: error instanceof Error ? error.message : 'Unknown error',
      errorName: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined
    }, 'Google token verification failed');

    if (error instanceof Error) {
      // Provide more specific error messages
      if (error.message.includes('Token used too early')) {
        throw new Error('Token used too early. Please try again.');
      }
      if (error.message.includes('Token used too late') || error.message.includes('expired')) {
        throw new Error('Token expired. Please sign in again.');
      }
      if (error.message.includes('Invalid token signature')) {
        throw new Error('Invalid token signature. The token may be corrupted.');
      }
      if (error.message.includes('audience') || error.message.includes('aud')) {
        throw new Error(`Token audience mismatch. Expected: ${GOOGLE_CLIENT_ID.substring(0, 30)}... Make sure frontend and backend use the same GOOGLE_CLIENT_ID.`);
      }
      if (error.message.includes('issuer')) {
        throw new Error('Invalid token issuer. Token is not from Google.');
      }
      throw new Error(`Failed to verify Google token: ${error.message}`);
    }
    throw new Error('Failed to verify Google token: Unknown error occurred');
  }
}

export async function loginOrRegisterWithGoogle(googleData: GoogleTokenPayload) {
  // Check if user exists by email
  let user = await prisma.user.findUnique({
    where: { email: googleData.email }
  });

  if (!user) {
    // Create new user with Google OAuth
    // Generate a random password since we won't use it for Google OAuth users
    const randomPassword = Math.random().toString(36).slice(-12);
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.default.hash(randomPassword, 10);

    user = await prisma.user.create({
      data: {
        email: googleData.email,
        name: googleData.name,
        password: hashedPassword, // Store a hashed random password
        role: 'MANAGER' // Default role for Google OAuth users
      }
    });

    logger.info({ email: user.email, userId: user.id, role: user.role }, 'Created new user via Google OAuth');
  } else {
    logger.info({ email: user.email, userId: user.id, role: user.role }, 'User logged in via Google OAuth');
  }

  // Generate JWT token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role
  });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  };
}

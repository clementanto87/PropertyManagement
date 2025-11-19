import { prisma } from '../../db/prisma';
import { generateToken } from '../../utils/jwt';

export interface MicrosoftTokenPayload {
  email: string;
  name: string;
  sub: string; // Microsoft user ID
}

export async function verifyMicrosoftToken(accessToken: string): Promise<MicrosoftTokenPayload> {
  try {
    // Verify token with Microsoft Graph API
    const response = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Invalid Microsoft token');
    }

    const data = await response.json();
    
    return {
      email: data.mail || data.userPrincipalName,
      name: data.displayName || data.mail?.split('@')[0] || 'User',
      sub: data.id
    };
  } catch (error) {
    throw new Error('Failed to verify Microsoft token');
  }
}

export async function loginOrRegisterWithMicrosoft(microsoftData: MicrosoftTokenPayload) {
  // Check if user exists by email
  let user = await prisma.user.findUnique({
    where: { email: microsoftData.email }
  });

  if (!user) {
    // Create new user with Microsoft OAuth
    // Generate a random password since we won't use it for Microsoft OAuth users
    const randomPassword = Math.random().toString(36).slice(-12);
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.default.hash(randomPassword, 10);

    user = await prisma.user.create({
      data: {
        email: microsoftData.email,
        name: microsoftData.name,
        password: hashedPassword // Store a hashed random password
      }
    });
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

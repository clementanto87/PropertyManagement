import { prisma } from '../../db/prisma';
import { Role } from '@prisma/client';
import crypto from 'crypto';

export interface UserDataLocation {
  model: string;
  field: string;
  recordId: string;
  value: string;
  relatedEntity?: string;
}

export interface UserDataSummary {
  userId: string;
  userEmail: string;
  userName: string | null;
  dataLocations: UserDataLocation[];
  totalRecords: number;
}

/**
 * Scans all database models to find where a user's information is stored
 */
export async function getUserDataLocations(userId: string): Promise<UserDataSummary> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { tenant: true }
  });

  if (!user) {
    throw new Error('User not found');
  }

  const dataLocations: UserDataLocation[] = [];

  // 1. User model itself
  if (user.email) {
    dataLocations.push({
      model: 'User',
      field: 'email',
      recordId: user.id,
      value: user.email
    });
  }
  if (user.name) {
    dataLocations.push({
      model: 'User',
      field: 'name',
      recordId: user.id,
      value: user.name
    });
  }

  // 2. Tenant model (if user is linked to a tenant)
  if (user.tenant) {
    if (user.tenant.email) {
      dataLocations.push({
        model: 'Tenant',
        field: 'email',
        recordId: user.tenant.id,
        value: user.tenant.email,
        relatedEntity: 'User'
      });
    }
    if (user.tenant.name) {
      dataLocations.push({
        model: 'Tenant',
        field: 'name',
        recordId: user.tenant.id,
        value: user.tenant.name,
        relatedEntity: 'User'
      });
    }
    if (user.tenant.phone) {
      dataLocations.push({
        model: 'Tenant',
        field: 'phone',
        recordId: user.tenant.id,
        value: user.tenant.phone,
        relatedEntity: 'User'
      });
    }
    if (user.tenant.emergencyContact) {
      dataLocations.push({
        model: 'Tenant',
        field: 'emergencyContact',
        recordId: user.tenant.id,
        value: user.tenant.emergencyContact,
        relatedEntity: 'User'
      });
    }
  }

  // 3. Communications (where user is the sender)
  const communications = await prisma.communication.findMany({
    where: { userId: user.id }
  });
  communications.forEach(comm => {
    if (comm.content) {
      dataLocations.push({
        model: 'Communication',
        field: 'content',
        recordId: comm.id,
        value: comm.content.substring(0, 100) + (comm.content.length > 100 ? '...' : ''),
        relatedEntity: 'User'
      });
    }
  });

  // 4. Posts (where user is the author)
  const posts = await prisma.post.findMany({
    where: { authorId: user.id }
  });
  posts.forEach(post => {
    if (post.content) {
      dataLocations.push({
        model: 'Post',
        field: 'content',
        recordId: post.id,
        value: post.content.substring(0, 100) + (post.content.length > 100 ? '...' : ''),
        relatedEntity: 'User'
      });
    }
  });

  // 5. Amenity Bookings
  const amenityBookings = await prisma.amenityBooking.findMany({
    where: { userId: user.id }
  });
  amenityBookings.forEach(booking => {
    dataLocations.push({
      model: 'AmenityBooking',
      field: 'userId',
      recordId: booking.id,
      value: user.id,
      relatedEntity: 'User'
    });
  });

  // 6. Audit Logs (where user is the actor)
  const auditLogs = await prisma.auditLog.findMany({
    where: { actorId: user.id }
  });
  auditLogs.forEach(log => {
    dataLocations.push({
      model: 'AuditLog',
      field: 'actorId',
      recordId: log.id,
      value: user.id,
      relatedEntity: 'User'
    });
  });

  // 7. Communications with tenant (if user has tenant)
  if (user.tenant) {
    const tenantCommunications = await prisma.communication.findMany({
      where: { tenantId: user.tenant.id }
    });
    tenantCommunications.forEach(comm => {
      if (comm.content) {
        dataLocations.push({
          model: 'Communication',
          field: 'content',
          recordId: comm.id,
          value: comm.content.substring(0, 100) + (comm.content.length > 100 ? '...' : ''),
          relatedEntity: 'Tenant'
        });
      }
    });
  }

  // 8. Lease Signatures (if user has tenant)
  if (user.tenant) {
    const leases = await prisma.lease.findMany({
      where: { tenantId: user.tenant.id },
      include: {
        agreements: {
          include: {
            signatures: true
          }
        }
      }
    });

    leases.forEach(lease => {
      lease.agreements.forEach(agreement => {
        agreement.signatures.forEach(signature => {
          if (signature.signerEmail === user.tenant?.email || signature.signerEmail === user.email) {
            dataLocations.push({
              model: 'LeaseSignature',
              field: 'signerEmail',
              recordId: signature.id,
              value: signature.signerEmail,
              relatedEntity: 'Lease'
            });
            if (signature.signerName) {
              dataLocations.push({
                model: 'LeaseSignature',
                field: 'signerName',
                recordId: signature.id,
                value: signature.signerName,
                relatedEntity: 'Lease'
              });
            }
          }
        });
      });
    });
  }

  return {
    userId: user.id,
    userEmail: user.email,
    userName: user.name,
    dataLocations,
    totalRecords: dataLocations.length
  };
}

/**
 * Anonymizes all user data across all models
 */
export async function anonymizeUserData(userId: string, actorId: string): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { tenant: true }
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Generate anonymized values
  const anonymizedEmail = `anonymized-${crypto.randomBytes(8).toString('hex')}@deleted.local`;
  const anonymizedName = 'Anonymized User';
  const anonymizedPhone = '000-000-0000';

  // Start transaction to ensure all or nothing
  await prisma.$transaction(async (tx) => {
    // 1. Anonymize User model
    await tx.user.update({
      where: { id: userId },
      data: {
        email: anonymizedEmail,
        name: anonymizedName,
        password: crypto.randomBytes(32).toString('hex'), // Randomize password
        otpCode: null,
        otpExpiresAt: null
      }
    });

    // 2. Anonymize Tenant model (if linked)
    if (user.tenant) {
      await tx.tenant.update({
        where: { id: user.tenant.id },
        data: {
          email: anonymizedEmail,
          name: anonymizedName,
          phone: anonymizedPhone,
          emergencyContact: null
        }
      });
    }

    // 3. Anonymize Communications content (where user is sender)
    const communications = await tx.communication.findMany({
      where: { userId: userId }
    });
    for (const comm of communications) {
      await tx.communication.update({
        where: { id: comm.id },
        data: {
          content: '[Content anonymized per GDPR request]',
          summary: '[Summary anonymized per GDPR request]'
        }
      });
    }

    // 4. Anonymize Posts content (where user is author)
    const posts = await tx.post.findMany({
      where: { authorId: userId }
    });
    for (const post of posts) {
      await tx.post.update({
        where: { id: post.id },
        data: {
          content: '[Content anonymized per GDPR request]',
          title: '[Title anonymized per GDPR request]'
        }
      });
    }

    // 5. Anonymize Lease Signatures (if user has tenant)
    if (user.tenant) {
      const leases = await tx.lease.findMany({
        where: { tenantId: user.tenant.id },
        include: {
          agreements: {
            include: {
              signatures: true
            }
          }
        }
      });

      for (const lease of leases) {
        for (const agreement of lease.agreements) {
          for (const signature of agreement.signatures) {
            if (signature.signerEmail === user.tenant?.email || signature.signerEmail === user.email) {
              await tx.leaseSignature.update({
                where: { id: signature.id },
                data: {
                  signerEmail: anonymizedEmail,
                  signerName: anonymizedName,
                  signatureData: null,
                  ipAddress: null
                }
              });
            }
          }
        }
      }
    }

    // 6. Log the anonymization action
    await tx.auditLog.create({
      data: {
        actorId: actorId,
        action: 'ANONYMIZE_USER_DATA',
        entity: 'User',
        entityId: userId
      }
    });
  });
}

/**
 * List all users (for managers to select which user to view/anonymize)
 */
export async function listAllUsers() {
  return prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      tenant: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}


import { prisma } from '../../db/prisma';
import * as bcrypt from 'bcryptjs';
import type { CreateUserInput, UpdateUserInput } from './validation';

export async function listUsers(opts?: { skip?: number; take?: number; role?: string }) {
    const where = opts?.role ? { role: opts.role as any } : {};
    return prisma.user.findMany({
        where,
        skip: opts?.skip,
        take: opts?.take,
        orderBy: { createdAt: 'desc' },
        include: {
            managedProperties: {
                select: { id: true, name: true }
            },
            managedUnits: {
                select: { id: true, unitNumber: true }
            }
        }
    });
}

export async function createUser(data: CreateUserInput) {
    const { propertyIds, unitIds, password, ...rest } = data;
    // Generate a random password if not provided (8 characters)
    const finalPassword = password || Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(finalPassword, 10);

    return prisma.user.create({
        data: {
            ...rest,
            password: hashedPassword,
            managedProperties: propertyIds ? { connect: propertyIds.map(id => ({ id })) } : undefined,
            managedUnits: unitIds ? { connect: unitIds.map(id => ({ id })) } : undefined,
        },
    });
}

export async function getUser(id: string) {
    return prisma.user.findUnique({
        where: { id },
        include: {
            managedProperties: true,
            managedUnits: true
        }
    });
}

export async function updateUser(id: string, data: UpdateUserInput) {
    return prisma.user.update({
        where: { id },
        data,
    });
}

export async function deleteUser(id: string) {
    return prisma.user.delete({ where: { id } });
}

export async function assignPropertiesToUser(userId: string, propertyIds?: string[], unitIds?: string[]) {
    // First disconnect all, then connect new ones to replace
    await prisma.user.update({
        where: { id: userId },
        data: {
            managedProperties: {
                set: [],
            },
            managedUnits: {
                set: [],
            },
        },
    });

    return prisma.user.update({
        where: { id: userId },
        data: {
            managedProperties: propertyIds ? { connect: propertyIds.map(id => ({ id })) } : undefined,
            managedUnits: unitIds ? { connect: unitIds.map(id => ({ id })) } : undefined,
        },
        include: {
            managedProperties: true,
            managedUnits: true
        }
    });
}

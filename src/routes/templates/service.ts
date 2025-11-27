import { prisma } from '../../db/prisma';
import { Prisma } from '@prisma/client';

export const getTemplates = async (filters: { type?: 'EMAIL' | 'AGREEMENT' | 'INVOICE'; category?: string; isActive?: boolean }) => {
    const where: Prisma.TemplateWhereInput = {};

    if (filters.type) {
        where.type = filters.type;
    }

    if (filters.category) {
        where.category = filters.category;
    }

    if (filters.isActive !== undefined) {
        where.isActive = filters.isActive;
    }

    return prisma.template.findMany({
        where,
        orderBy: { createdAt: 'desc' },
    });
};

export const getTemplateById = async (id: string) => {
    return prisma.template.findUnique({
        where: { id },
    });
};

export const createTemplate = async (data: Prisma.TemplateCreateInput) => {
    return prisma.template.create({
        data,
    });
};

export const updateTemplate = async (id: string, data: Prisma.TemplateUpdateInput) => {
    return prisma.template.update({
        where: { id },
        data,
    });
};

export const deleteTemplate = async (id: string) => {
    return prisma.template.delete({
        where: { id },
    });
};

import { prisma } from '../../db/prisma';
import { CreateEmailTemplateInput, UpdateEmailTemplateInput } from './validation';

export const getEmailTemplates = async (filters: { category?: string; isActive?: boolean } = {}) => {
    const where: any = {};

    if (filters.category) {
        where.category = filters.category;
    }

    if (filters.isActive !== undefined) {
        where.isActive = filters.isActive;
    }

    return prisma.emailTemplate.findMany({
        where,
        orderBy: {
            createdAt: 'desc',
        },
    });
};

export const getEmailTemplateById = async (id: string) => {
    return prisma.emailTemplate.findUnique({
        where: { id },
    });
};

export const createEmailTemplate = async (data: CreateEmailTemplateInput) => {
    return prisma.emailTemplate.create({
        data,
    });
};

export const updateEmailTemplate = async (id: string, data: UpdateEmailTemplateInput) => {
    return prisma.emailTemplate.update({
        where: { id },
        data,
    });
};

export const deleteEmailTemplate = async (id: string) => {
    return prisma.emailTemplate.delete({
        where: { id },
    });
};

// Helper function to replace template variables
export const replaceTemplateVariables = (template: string, variables: Record<string, string>): string => {
    let result = template;
    Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        result = result.replace(regex, value);
    });
    return result;
};

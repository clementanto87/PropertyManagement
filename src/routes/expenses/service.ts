import { prisma } from '../../db/prisma';
import type { CreateExpenseInput, UpdateExpenseInput } from './validation';

export async function listExpenses(propertyId?: string, opts?: { skip?: number; take?: number }) {
  return prisma.expense.findMany({
    where: propertyId ? { propertyId } : undefined,
    orderBy: { incurredAt: 'desc' },
    skip: opts?.skip,
    take: opts?.take
  });
}

export async function createExpense(data: CreateExpenseInput) {
  const payload = { ...data, incurredAt: new Date(data.incurredAt) };
  return prisma.expense.create({ data: payload });
}

export async function getExpense(id: string) {
  return prisma.expense.findUnique({ where: { id } });
}

export async function updateExpense(id: string, data: UpdateExpenseInput) {
  const payload: any = { ...data };
  if (payload.incurredAt) payload.incurredAt = new Date(payload.incurredAt);
  return prisma.expense.update({ where: { id }, data: payload });
}

export async function deleteExpense(id: string) {
  return prisma.expense.delete({ where: { id } });
}

export type PaginationOptions = {
  skip: number;
  take: number;
};

export function parsePagination(query: Record<string, unknown>, defaults?: { limit?: number }): PaginationOptions {
  const pageRaw = typeof query.page === 'string' ? parseInt(query.page, 10) : NaN;
  const limitRaw = typeof query.limit === 'string' ? parseInt(query.limit, 10) : NaN;

  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;
  const limitDefault = defaults?.limit ?? 20;
  const limitCap = 100;
  const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, limitCap) : limitDefault;

  return { skip: (page - 1) * limit, take: limit };
}

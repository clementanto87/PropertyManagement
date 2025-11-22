import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { leaseService, type Lease } from '../services/leases';
import { paymentService, type Payment, type PaymentMethod } from '../services/payments';
import { workOrderService, type WorkOrder } from '../services/workOrders';
import { documentService, type Document } from '../services/documents';
import { communicationService, type Communication } from '../services/communications';

const useTenantId = () => {
  const { user } = useAuth();
  return user?.id ?? null;
};

export const useTenantLease = () => {
  const tenantId = useTenantId();
  return useQuery({
    queryKey: ['tenant', 'lease', tenantId],
    queryFn: async (): Promise<Lease | null> => {
      if (!tenantId) return null;
      return leaseService.getActiveLease(tenantId);
    },
    enabled: Boolean(tenantId)
  });
};

export const useTenantPayments = () => {
  const tenantId = useTenantId();
  return useQuery({
    queryKey: ['tenant', 'payments', tenantId],
    queryFn: async () => {
      if (!tenantId)
        return { items: [], upcoming: [], history: [] } as {
          items: Payment[];
          upcoming: Payment[];
          history: Payment[];
        };
      const payments = await paymentService.list({ tenantId });
      const upcoming = payments.filter((payment) => payment.status !== 'PAID');
      const history = payments.filter((payment) => payment.status === 'PAID');
      return { items: payments, upcoming, history };
    },
    enabled: Boolean(tenantId)
  });
};

type RecordPaymentVariables = {
  paymentId: string;
  paidAt: string;
  paymentMethod: PaymentMethod;
  notes?: string;
};

export const useRecordPayment = () => {
  const tenantId = useTenantId();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ paymentId, ...payload }: RecordPaymentVariables) => paymentService.recordPayment(paymentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'payments', tenantId] });
    }
  });
};

export const useTenantWorkOrders = (unitId?: string | null) => {
  return useQuery({
    queryKey: ['tenant', 'workOrders', unitId],
    queryFn: async (): Promise<WorkOrder[]> => {
      if (!unitId) return [];
      return workOrderService.list({ unitId });
    },
    enabled: Boolean(unitId)
  });
};

type CreateWorkOrderVariables = {
  unitId: string;
  title: string;
  description?: string;
};

export const useCreateWorkOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: CreateWorkOrderVariables) => workOrderService.create(variables),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'workOrders', variables.unitId] });
    }
  });
};

export const useTenantDocuments = () => {
  const tenantId = useTenantId();
  return useQuery({
    queryKey: ['tenant', 'documents', tenantId],
    queryFn: async (): Promise<Document[]> => {
      if (!tenantId) return [];
      return documentService.listByTenant(tenantId);
    },
    enabled: Boolean(tenantId)
  });
};

export const useTenantCommunications = () => {
  const tenantId = useTenantId();
  return useQuery({
    queryKey: ['tenant', 'communications', tenantId],
    queryFn: async (): Promise<Communication[]> => {
      if (!tenantId) return [];
      return communicationService.listByTenant(tenantId);
    },
    enabled: Boolean(tenantId)
  });
};

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import * as leaseService from '../services/leases';
import * as paymentService from '../services/payments';
import * as workOrderService from '../services/workOrders';
import * as documentService from '../services/documents';
import * as communicationService from '../services/communications';
import { Lease, Payment, WorkOrder, Document, Communication } from '../types';

export const useTenantLease = () => {
  const { user } = useAuth();
  return useQuery<Lease | null, Error>({
    queryKey: ['tenant', 'lease', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      return leaseService.getActiveLease(user.id);
    },
    enabled: !!user?.id,
  });
};

export const useTenantPayments = (filters = {}) => {
  const { user } = useAuth();
  return useQuery<Payment[], Error>({
    queryKey: ['tenant', 'payments', user?.id, filters],
    queryFn: async () => {
      if (!user?.id) return [];
      return paymentService.listPayments(user.id, filters);
    },
    enabled: !!user?.id,
  });
};

export const useRecordPayment = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation(
    async (paymentData: { amount: number; date: string; method: string; reference: string }) => {
      if (!user?.id) throw new Error('User not authenticated');
      return paymentService.recordPayment(user.id, paymentData);
    },
    {
      onSuccess: () => {
        // Invalidate and refetch payments and lease data
        queryClient.invalidateQueries(['tenant', 'payments', user?.id]);
        queryClient.invalidateQueries(['tenant', 'lease', user?.id]);
      },
    }
  );
};

export const useTenantWorkOrders = (status?: string) => {
  const { user } = useAuth();
  return useQuery<WorkOrder[], Error>({
    queryKey: ['tenant', 'work-orders', user?.id, status],
    queryFn: async () => {
      if (!user?.id) return [];
      return workOrderService.listWorkOrders(user.id, status);
    },
    enabled: !!user?.id,
  });
};

export const useCreateWorkOrder = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  return useMutation(
    async (workOrderData: { title: string; description: string; priority: 'low' | 'medium' | 'high' }) => {
      if (!user?.id) throw new Error('User not authenticated');
      return workOrderService.createWorkOrder(user.id, workOrderData);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['tenant', 'work-orders', user?.id]);
      },
    }
  );
};

export const useTenantDocuments = () => {
  const { user } = useAuth();
  return useQuery<Document[], Error>({
    queryKey: ['tenant', 'documents', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return documentService.listByTenant(user.id);
    },
    enabled: !!user?.id,
  });
};

export const useTenantCommunications = () => {
  const { user } = useAuth();
  return useQuery<Communication[], Error>({
    queryKey: ['tenant', 'communications', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      return communicationService.listByTenant(user.id);
    },
    enabled: !!user?.id,
  });
};

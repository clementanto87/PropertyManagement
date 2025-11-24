import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tenantAPI } from '../services/api';
import type {
    DashboardData,
    TenantProfile,
    Payment,
    MaintenanceRequest,
    CreateMaintenanceRequest,
    Document,
    UpdateProfileRequest,
} from '../types/api';

// Query Keys
export const queryKeys = {
    dashboard: ['dashboard'] as const,
    profile: ['profile'] as const,
    payments: ['payments'] as const,
    maintenance: ['maintenance'] as const,
    documents: ['documents'] as const,
};

// Dashboard Hook
export const useDashboard = () => {
    return useQuery({
        queryKey: queryKeys.dashboard,
        queryFn: () => tenantAPI.getDashboard(),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

// Profile Hooks
export const useProfile = () => {
    return useQuery({
        queryKey: queryKeys.profile,
        queryFn: () => tenantAPI.getProfile(),
        staleTime: 1000 * 60 * 10, // 10 minutes
    });
};

export const useUpdateProfile = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: UpdateProfileRequest) => tenantAPI.updateProfile(data),
        onSuccess: (data) => {
            queryClient.setQueryData(queryKeys.profile, data);
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
        },
    });
};

export const useUploadProfilePhoto = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (imageUri: string) => tenantAPI.uploadProfilePhoto(imageUri),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.profile });
        },
    });
};

// Payment Hooks
export const usePayments = () => {
    return useQuery({
        queryKey: queryKeys.payments,
        queryFn: () => tenantAPI.getPayments(),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

// Maintenance Hooks
export const useMaintenanceRequests = () => {
    return useQuery({
        queryKey: queryKeys.maintenance,
        queryFn: () => tenantAPI.getMaintenanceRequests(),
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
};

export const useCreateMaintenanceRequest = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateMaintenanceRequest) =>
            tenantAPI.createMaintenanceRequest(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.maintenance });
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
        },
    });
};

export const useUploadMaintenanceImage = () => {
    return useMutation({
        mutationFn: (imageUri: string) => tenantAPI.uploadMaintenanceImage(imageUri),
    });
};

// Document Hooks
export const useDocuments = () => {
    return useQuery({
        queryKey: queryKeys.documents,
        queryFn: () => tenantAPI.getDocuments(),
        staleTime: 1000 * 60 * 10, // 10 minutes
    });
};

export const useUploadDocument = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: { fileUri: string; name: string; type: string; category: string; description?: string }) =>
            tenantAPI.uploadDocument(data.fileUri, data.name, data.type, data.category, data.description),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.documents });
            queryClient.invalidateQueries({ queryKey: queryKeys.dashboard });
        },
    });
};

export const useDownloadDocument = () => {
    return useMutation({
        mutationFn: (documentId: number) => tenantAPI.downloadDocument(documentId),
    });
};

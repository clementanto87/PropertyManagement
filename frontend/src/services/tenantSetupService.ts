import { api } from '@/lib/api';

export interface ValidateTokenResponse {
    valid: boolean;
    tenantName: string;
    email: string;
    expiresAt: string;
}

export interface AcceptInvitationResponse {
    success: boolean;
    message: string;
    email: string;
    token: string;
    user: {
        id: string;
        name: string;
        email: string;
        role: string;
    };
}

export const tenantSetupService = {
    async validateToken(token: string): Promise<ValidateTokenResponse> {
        return api.get<ValidateTokenResponse>(`/tenant-invitations/validate/${token}`);
    },

    async acceptInvitation(token: string, password: string): Promise<AcceptInvitationResponse> {
        return api.post<AcceptInvitationResponse>('/tenant-invitations/accept', {
            token,
            password,
        });
    },
};

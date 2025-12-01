import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'tenant_auth_token';
const USER_KEY = 'tenant_user_data';

export const storage = {
    // Token management
    async saveToken(token: string): Promise<void> {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
    },

    async getToken(): Promise<string | null> {
        return await SecureStore.getItemAsync(TOKEN_KEY);
    },

    async removeToken(): Promise<void> {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
    },

    // User data management
    async saveUser(userData: any): Promise<void> {
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData));
    },

    async getUser(): Promise<any | null> {
        const data = await SecureStore.getItemAsync(USER_KEY);
        return data ? JSON.parse(data) : null;
    },

    async removeUser(): Promise<void> {
        await SecureStore.deleteItemAsync(USER_KEY);
    },

    // Clear all data
    async clearAll(): Promise<void> {
        await this.removeToken();
        await this.removeUser();
    }
};

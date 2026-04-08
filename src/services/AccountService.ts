import axiosInstance from "@/api/axiosInstance";

export interface RegisterDto {
    fullName: string;
    email: string;
    phoneNumber: string;
    password?: string;
}

export interface LoginDto {
    userNameOrEmail: string;
    password: string;
}

export interface ResetPasswordDto {
    email: string;
    otpCode: string;
    newPassword: string;
}

class AccountService {
    async register(data: RegisterDto): Promise<any> {
        const response = await axiosInstance.post(`/accounts/register`, data);
        return response.data;
    }

    async login(data: LoginDto): Promise<string> {
        const response = await axiosInstance.post(`/accounts/login`, data);
        return response.data.data as string;
    }

    async forgotPassword(email: string): Promise<{ data: string; message: string }> {
        const response = await axiosInstance.post(`/accounts/forgot-password`, { email });
        return response.data;
    }

    async resetPassword(dto: ResetPasswordDto): Promise<any> {
        const response = await axiosInstance.post(`/accounts/reset-password`, dto);
        return response.data;
    }

    async getProfile(): Promise<any> {
        const response = await axiosInstance.get(`/accounts/profile`);
        return response.data.data;
    }

    async updateProfile(data: { fullName: string; phoneNumber: string }): Promise<any> {
        const response = await axiosInstance.put(`/accounts/profile`, data);
        return response.data;
    }

    async changePassword(data: { currentPassword: string; newPassword: string }): Promise<any> {
        const response = await axiosInstance.put(`/accounts/profile/change-password`, data);
        return response.data;
    }
}

export const accountService = new AccountService();

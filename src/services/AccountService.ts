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

class AccountService {
    async register(data: RegisterDto): Promise<any> {
        const response = await axiosInstance.post(`/accounts/register`, data);
        return response.data;
    }

    async login(data: LoginDto): Promise<string> {
        const response = await axiosInstance.post(`/accounts/login`, data);
        return response.data.data as string;
    }
}

export const accountService = new AccountService();

export interface User {
    id: string;
    username: string;
    email: string;
    passwordHash: string;
    role: 'admin' | 'user';
    createdAt: string;
}

export interface AuthUser {
    id: string;
    username: string;
    email: string;
    role: 'admin' | 'user';
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    username: string;
    email: string;
    password: string;
}

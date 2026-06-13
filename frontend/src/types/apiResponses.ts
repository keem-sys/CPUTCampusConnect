export interface BackendErrorResponse {
    status: number;
    error: string;
    message: string;
    timestamp: string;
}

export interface UserProfile {
    userId: string;
    fullName: string;
    email: string;
    role: 'STUDENT' | 'ORGANIZER' | 'ADMIN';
}
import React from "react";

export interface BackendErrorResponse {
    status: number;
    error: string;
    message: string;
    timestamp: string;
}

export type Role = 'STUDENT' | 'ORGANIZER' | 'ADMIN';

export interface UserProfile {
    userId: string;
    fullName: string;
    email: string;
    role: Role;
}

export interface LocationState {
    from?: {
        pathname: string;
    };
}

export interface LayoutContextType {
    user: UserProfile | null;
    setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}
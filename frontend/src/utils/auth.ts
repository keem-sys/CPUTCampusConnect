import type { Role } from '../types/apiResponses';

export function getUserRoleFromToken(tokenString?: string | null): Role | null {
    const token = tokenString || localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) return null;

    try {
        const payloadBase64 = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));
        return (decodedPayload.role as Role) || null;
    } catch {
        return null;
    }
}

export function getDefaultRouteForRole(role?: Role | null): string {
    switch (role) {
        case 'ADMIN':
            return '/admin/dashboard';
        case 'ORGANIZER':
            return '/organizer/events';
        case 'STUDENT':
        default:
            return '/dashboard';
    }
}
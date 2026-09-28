import { Navigate, Outlet, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import type {Role} from "../types/apiResponses.ts";

interface ProtectedRouteProps {
    allowedRoles?: Role[];
}

function getUserRoleFromToken(): Role | null {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) return null;

    try {
        const payloadBase64 = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));
        return (decodedPayload.role as Role) || null;
    } catch {
        return null;
    }
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const location = useLocation();
    const userRole = getUserRoleFromToken();

    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
        toast.error('Access Denied: You do not have permission to view this page.');
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}
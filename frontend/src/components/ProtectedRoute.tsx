import { Navigate, Outlet, useLocation, useOutletContext } from 'react-router-dom'; // <-- 1. Import useOutletContext
import type { Role } from '../types/apiResponses';
import toast from 'react-hot-toast';

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

    const context = useOutletContext();

    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
        toast.error('Access Denied: You do not have permission to view this page.');
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet context={context} />;
}
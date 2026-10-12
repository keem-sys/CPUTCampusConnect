import { Navigate, Outlet, useLocation, useOutletContext } from 'react-router-dom';
import type { Role } from '../types/apiResponses';
import toast from 'react-hot-toast';
import {getUserRoleFromToken} from "../utils/auth.ts";

interface ProtectedRouteProps {
    allowedRoles?: Role[];
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
import { Navigate } from 'react-router-dom';
import {getDefaultRouteForRole, getUserRoleFromToken} from "../utils/auth.ts";

export default function RootRedirect() {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    const userRole = getUserRoleFromToken(token);
    const targetRoute = getDefaultRouteForRole(userRole);

    return <Navigate to={targetRoute} replace />;
}
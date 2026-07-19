import {Navigate, Outlet, useLocation} from 'react-router-dom';

export default function ProtectedRoute() {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const location = useLocation();

    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
}
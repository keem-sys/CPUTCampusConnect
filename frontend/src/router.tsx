import { createBrowserRouter } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ProfileSettings from './pages/ProfileSettings';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout'; // <-- Import the Layout

export const router = createBrowserRouter([
    { path: '/login', element: <Login /> },
    { path: '/register', element: <Register /> },

    // Protected Routes
    {
        element: <ProtectedRoute />,
        children: [
            {
                element: <AppLayout />,
                children: [
                    {
                        path: '/dashboard',
                        element: <Dashboard />,
                    },
                    {
                        path: '/settings',
                        element: <ProfileSettings />,
                    },
                ],
            },
        ],
    },

    {
        element: <ProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN']} />,
        children: [
            { path: '/events/create', element: <div>Create Event Page (Organizers Only)</div> },
            { path: '/events/manage', element: <div>Manage RSVPs (Organizers Only)</div> },
        ],
    },

    {
        element: <ProtectedRoute allowedRoles={['ADMIN']} />,
        children: [
            { path: '/admin/users', element: <div>Admin User Management (Admins Only)</div> },
        ],
    },

    // Fallback 404
    {
        path: '*',
        element: <div className="flex h-screen items-center justify-center font-bold text-red-500">404 - Page Not Found</div>,
    },
]);
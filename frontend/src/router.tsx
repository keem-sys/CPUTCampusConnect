import { createBrowserRouter } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ProfileSettings from './pages/ProfileSettings';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import RootRedirect from "./components/RootRedirect";
import StudentRsvps from './pages/StudentRsvps';
import CreateEvent from "./pages/CreateEvent";
import OrganizerEvents from "./pages/OrganizerEvents";
import EventDetails from "./pages/EventDetails.tsx";
import ManageEvents from "./pages/ManageEvents.tsx";

export const router = createBrowserRouter([
    {
        path: '/',
        element: <RootRedirect />,
    },
    { path: '/login', element: <Login /> },
    { path: '/register', element: <Register /> },

    {
        element: <ProtectedRoute />,
        children: [
            {
                element: <AppLayout />,
                children: [
                    // Common routes (Students, Organizers, Admins)
                    {
                        path: '/dashboard',
                        element: <Dashboard />,
                    },
                    {
                        path: '/events/:id',
                        element: <EventDetails />,
                    },
                    {
                        path: '/settings',
                        element: <ProfileSettings />,
                    },
                    {
                        path: '/my-rsvps',
                        element: <StudentRsvps />,
                    },

                    // Organizer & Admin ONLY routes
                    {
                        element: <ProtectedRoute allowedRoles={['ORGANIZER', 'ADMIN']} />,
                        children: [
                            {
                                path: '/organizer/events',
                                element: <OrganizerEvents />,
                            },
                            {
                                path: '/events/create',
                                element: <CreateEvent />,
                            },
                            {
                                path: '/events/:id/manage',
                                element: <ManageEvents />,
                            },
                        ],
                    },

                    // Admin ONLY routes
                    {
                        element: <ProtectedRoute allowedRoles={['ADMIN']} />,
                        children: [
                            {
                                path: '/admin/users',
                                element: <div>Admin User Management (Admins Only)</div>
                            },
                        ],
                    },
                ],
            },
        ],
    },

    // Fallback 404
    {
        path: '*',
        element: <div className="flex h-screen items-center justify-center font-bold text-red-500">404 - Page Not Found</div>,
    },
]);
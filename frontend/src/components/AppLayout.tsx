import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import type {UserProfile} from './Navbar';
import Footer from './Footer';
import axiosClient from '../services/axiosClient';
import toast from 'react-hot-toast';

export default function AppLayout() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axiosClient.get<UserProfile>('/api/users/me');
                setUser(response.data);
            } catch (err: unknown) {
                toast.error('Session expired. Please log in again.');
                localStorage.removeItem('token');
                sessionStorage.removeItem('token');
                navigate('/login', { replace: true });
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [navigate]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-app font-brand">
                <div className="text-sm font-semibold text-brand-primary animate-pulse">
                    Loading Campus Connect...
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col bg-app font-brand">
            {/* 1. Universal conditional Navbar */}
            <Navbar user={user} />

            {/* 2. Dynamic Child Page (/dashboard, /settings, etc.) */}
            <div className="flex-1">
                <Outlet context={{ user }} />
            </div>

            {/* 3. Universal Footer */}
            <Footer />
        </div>
    );
}
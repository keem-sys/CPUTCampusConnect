import { useState } from 'react';
import {
    Landmark,
    Settings as SettingsIcon,
    LogOut,
    Plus,
    Calendar,
    BookmarkCheck,
    ShieldCheck,
    Menu,
    X
} from 'lucide-react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';

export interface UserProfile {
    userId: string;
    fullName: string;
    email: string;
    role: 'STUDENT' | 'ORGANIZER' | 'ADMIN';
}

interface NavbarProps {
    user: UserProfile | null;
}

export default function Navbar({ user }: NavbarProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        toast.success('Logged out successfully');
        navigate('/login', { replace: true });
    };

    const isActive = (path: string) => location.pathname === path;

    return (
        <header className="sticky top-0 z-40 border-b border-ui-border bg-white shadow-subtle font-brand">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">

                {/* Left: Brand Logo */}
                <Link to="/dashboard" className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary shadow-sm">
                        <Landmark className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex flex-col">
            <span className="text-lg font-extrabold tracking-tight text-brand-primary leading-tight">
              Campus Connect
            </span>
                        <span className="text-[10px] font-medium text-muted">
              CPUT Event Management
            </span>
                    </div>
                </Link>

                {/* Center: Conditional Navigation Links based on Role */}
                {user && (
                    <nav className="hidden md:flex items-center gap-1">
                        {/* Common: Browse Events */}
                        <Link
                            to="/dashboard"
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                                isActive('/dashboard')
                                    ? 'bg-blue-50 text-brand-primary'
                                    : 'text-muted hover:text-brand-primary hover:bg-gray-100'
                            }`}
                        >
                            <Calendar className="h-4 w-4" />
                            Explore Events
                        </Link>

                        {/* Student specific link */}
                        {user.role === 'STUDENT' && (
                            <button
                                onClick={() => toast('My RSVPs view is coming soon!')}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-muted hover:text-brand-primary hover:bg-gray-100 transition-colors cursor-pointer"
                            >
                                <BookmarkCheck className="h-4 w-4" />
                                My RSVPs
                            </button>
                        )}

                        {/* Organizer specific link */}
                        {user.role === 'ORGANIZER' && (
                            <button
                                onClick={() => toast('Event Creation modal is coming in the next step!')}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-brand-accent hover:bg-orange-50 transition-colors cursor-pointer"
                            >
                                <Plus className="h-4 w-4" />
                                Create Event
                            </button>
                        )}

                        {/* Admin specific link */}
                        {user.role === 'ADMIN' && (
                            <button
                                onClick={() => toast('Admin Portal view coming soon!')}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-purple-700 hover:bg-purple-50 transition-colors cursor-pointer"
                            >
                                <ShieldCheck className="h-4 w-4" />
                                Admin Panel
                            </button>
                        )}
                    </nav>
                )}

                {/* Right: User Profile & Actions */}
                <div className="flex items-center gap-3">
                    {user ? (
                        <>
                            {/* User details & role badge */}
                            <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-brand-primary leading-tight">
                  {user.fullName}
                </span>
                                <span className="text-[10px] font-semibold text-brand-accent tracking-wider uppercase">
                  {user.role}
                </span>
                            </div>

                            {/* Profile Settings Link */}
                            <Link
                                to="/settings"
                                title="Profile Settings"
                                className={`flex h-9 w-9 items-center justify-center rounded-lg border transition-colors ${
                                    isActive('/settings')
                                        ? 'border-brand-primary bg-blue-50 text-brand-primary'
                                        : 'border-ui-border bg-card text-muted hover:text-brand-primary hover:bg-gray-100'
                                }`}
                            >
                                <SettingsIcon className="h-4 w-4" />
                            </Link>

                            {/* Sign Out Button */}
                            <button
                                onClick={handleLogout}
                                title="Sign Out"
                                className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                            >
                                <LogOut className="h-4 w-4" />
                            </button>
                        </>
                    ) : (
                        // Logged-out state (if viewed publicly)
                        <div className="flex items-center gap-2">
                            <Link
                                to="/login"
                                className="rounded-lg px-3 py-1.5 text-xs font-bold text-brand-primary hover:bg-gray-100 transition-colors"
                            >
                                Sign In
                            </Link>
                            <Link
                                to="/register"
                                className="rounded-lg bg-brand-primary px-3 py-1.5 text-xs font-bold text-white hover:opacity-90 transition-opacity"
                            >
                                Register
                            </Link>
                        </div>
                    )}

                    {/* Mobile hamburger menu toggle */}
                    {user && (
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="flex md:hidden h-9 w-9 items-center justify-center rounded-lg border border-ui-border text-muted"
                        >
                            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                        </button>
                    )}
                </div>

            </div>

            {/* Mobile Dropdown Menu */}
            {user && mobileMenuOpen && (
                <div className="md:hidden border-t border-ui-border bg-white px-4 py-3 space-y-2">
                    <div className="pb-2 border-b border-ui-border">
                        <p className="text-xs font-bold text-brand-primary">{user.fullName}</p>
                        <p className="text-[10px] font-semibold text-brand-accent uppercase">{user.role}</p>
                    </div>
                    <Link
                        to="/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-1.5 text-xs font-semibold text-brand-primary"
                    >
                        Explore Events
                    </Link>
                    {user.role === 'ORGANIZER' && (
                        <button
                            onClick={() => {
                                setMobileMenuOpen(false);
                                toast('Event Creation coming next!');
                            }}
                            className="block w-full text-left py-1.5 text-xs font-semibold text-brand-accent"
                        >
                            Create New Event
                        </button>
                    )}
                    <Link
                        to="/settings"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-1.5 text-xs font-semibold text-brand-primary"
                    >
                        Profile Settings
                    </Link>
                </div>
            )}
        </header>
    );
}
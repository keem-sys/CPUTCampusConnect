import { useEffect, useState } from 'react';
import {
    Users,
    Calendar,
    BookmarkCheck,
    ShieldCheck,
    MapPin,
    ArrowUpRight,
    Sparkles,
    Building2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import axiosClient from '../services/axiosClient';
import toast from 'react-hot-toast';

interface RecentEvent {
    id: string;
    title: string;
    category: string;
    campus?: string;
    eventDate: string;
    registeredCount: number;
    capacity: number;
    organizerName: string;
}

interface RecentUser {
    userId: string;
    fullName: string;
    email: string;
    role: 'STUDENT' | 'ORGANIZER' | 'ADMIN';
}

interface AdminStats {
    totalStudents: number;
    totalOrganizers: number;
    totalEvents: number;
    totalRsvps: number;
    eventsByCampus: Record<string, number>;
    recentEvents: RecentEvent[];
    recentUsers: RecentUser[];
}

const CAMPUS_NAMES: Record<string, string> = {
    CAPE_TOWN: 'District Six',
    BELLVILLE: 'Bellville',
    GRANGER_BAY: 'Granger Bay',
    MOWBRAY: 'Mowbray',
    WELLINGTON: 'Wellington',
    ATHLONE: 'Athlone',
    ONLINE: 'Online / Virtual',
};

export default function AdminDashboard() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAdminStats = async () => {
            try {
                const response = await axiosClient.get<AdminStats>('/api/admin/stats');
                setStats(response.data);
            } catch (err: unknown) {
                toast.error('Unable to load administrator analytics.');
            } finally {
                setLoading(false);
            }
        };

        fetchAdminStats();
    }, []);

    if (loading) {
        return (
            <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-16 text-center text-sm font-semibold text-muted font-brand">
                Loading administrator metrics...
            </main>
        );
    }

    if (!stats) return null;

    return (
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8 font-brand text-primary">

            {/* Header & Quick Action Buttons */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2.5 py-0.5 text-[10px] font-bold text-purple-700 uppercase tracking-wide border border-purple-200">
              <ShieldCheck className="h-3 w-3" />
              Administrative Portal
            </span>
                    </div>
                    <h1 className="text-2xl font-black text-brand-primary sm:text-3xl">
                        System Overview & Metrics
                    </h1>
                    <p className="mt-1 text-sm text-muted">
                        Live health indicators, user account counts, and campus activity distribution across CPUT.
                    </p>
                </div>

                {/* Admin Navigation Short-cuts */}
                <div className="flex items-center gap-2.5 self-start sm:self-auto">
                    <Link
                        to="/admin/users"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-ui-border bg-card px-3.5 py-2 text-xs font-bold text-brand-primary shadow-subtle hover:bg-gray-50 transition-colors"
                    >
                        <Users className="h-4 w-4 text-brand-accent" />
                        Manage Users
                    </Link>
                    <Link
                        to="/admin/events"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-ui-border bg-card px-3.5 py-2 text-xs font-bold text-brand-primary shadow-subtle hover:bg-gray-50 transition-colors"
                    >
                        <Calendar className="h-4 w-4 text-purple-700" />
                        Moderate Events
                    </Link>
                </div>
            </div>

            {/* Top 4 KPI Cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">

                {/* Total Students */}
                <div className="rounded-2xl border border-ui-border bg-card p-5 shadow-subtle">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted">Students</span>
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-brand-primary">
                            <Users className="h-4 w-4" />
                        </div>
                    </div>
                    <p className="text-3xl font-black text-brand-primary">{stats.totalStudents}</p>
                    <p className="text-[11px] text-muted mt-1">Registered student seekers</p>
                </div>

                {/* Total Organizers */}
                <div className="rounded-2xl border border-ui-border bg-card p-5 shadow-subtle">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted">Organizers</span>
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
                            <Building2 className="h-4 w-4" />
                        </div>
                    </div>
                    <p className="text-3xl font-black text-brand-primary">{stats.totalOrganizers}</p>
                    <p className="text-[11px] text-muted mt-1">Clubs & faculty leaders</p>
                </div>

                {/* Total Events */}
                <div className="rounded-2xl border border-ui-border bg-card p-5 shadow-subtle">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted">Events Hosted</span>
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                            <Calendar className="h-4 w-4" />
                        </div>
                    </div>
                    <p className="text-3xl font-black text-brand-primary">{stats.totalEvents}</p>
                    <p className="text-[11px] text-muted mt-1">All campuses combined</p>
                </div>

                {/* Total RSVPs */}
                <div className="rounded-2xl border border-ui-border bg-card p-5 shadow-subtle">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-muted">Total RSVPs</span>
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
                            <BookmarkCheck className="h-4 w-4" />
                        </div>
                    </div>
                    <p className="text-3xl font-black text-brand-primary">{stats.totalRsvps}</p>
                    <p className="text-[11px] text-muted mt-1">Confirmed student seats</p>
                </div>

            </div>

            {/* Campus Distribution Grid */}
            <div className="rounded-2xl border border-ui-border bg-card p-6 shadow-subtle mb-8">
                <h2 className="text-base font-bold text-brand-primary mb-1">
                    CPUT Campus Activity Breakdown
                </h2>
                <p className="text-xs text-muted mb-6">
                    Distribution of scheduled events across physical campuses and virtual sessions.
                </p>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
                    {Object.entries(CAMPUS_NAMES).map(([key, label]) => {
                        const count = stats.eventsByCampus[key] || 0;
                        return (
                            <div
                                key={key}
                                className="rounded-xl border border-ui-border bg-[#F8F9FA] p-3 text-center"
                            >
                                <div className="flex items-center justify-center gap-1 text-[11px] font-bold text-brand-primary truncate mb-1">
                                    <MapPin className="h-3 w-3 text-brand-accent shrink-0" />
                                    <span className="truncate">{label}</span>
                                </div>
                                <p className="text-xl font-black text-brand-primary">{count}</p>
                                <span className="text-[10px] text-muted">events</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Two Column Layout: Recent Events & Recent Users */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">

                {/* Left: Latest Published Events */}
                <div className="rounded-2xl border border-ui-border bg-card p-6 shadow-subtle">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-base font-bold text-brand-primary">Latest Events Scheduled</h3>
                            <p className="text-xs text-muted">Most recent activities published to the calendar.</p>
                        </div>
                        <Link
                            to="/dashboard"
                            className="text-xs font-bold text-brand-accent hover:underline flex items-center gap-0.5"
                        >
                            Browse all <ArrowUpRight className="h-3 w-3" />
                        </Link>
                    </div>

                    {stats.recentEvents.length === 0 ? (
                        <p className="text-xs text-muted py-8 text-center">No events created yet.</p>
                    ) : (
                        <div className="divide-y divide-ui-border">
                            {stats.recentEvents.map((event) => (
                                <div key={event.id} className="py-3 flex items-center justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                      <span className="rounded bg-blue-50 px-1.5 py-0.5 text-[9px] font-bold text-brand-primary uppercase">
                        {event.category}
                      </span>
                                            <span className="text-[10px] text-muted">
                        {event.eventDate}
                      </span>
                                        </div>
                                        <Link
                                            to={`/events/${event.id}`}
                                            className="text-xs font-bold text-brand-primary hover:underline truncate block"
                                        >
                                            {event.title}
                                        </Link>
                                        <p className="text-[10px] text-muted mt-0.5">
                                            By {event.organizerName} • {event.registeredCount}/{event.capacity} booked
                                        </p>
                                    </div>

                                    <Link
                                        to={`/events/${event.id}`}
                                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-ui-border text-muted hover:text-brand-primary transition-colors"
                                    >
                                        <ArrowUpRight className="h-3.5 w-3.5" />
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: Latest Registered Accounts */}
                <div className="rounded-2xl border border-ui-border bg-card p-6 shadow-subtle">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-base font-bold text-brand-primary">Recently Registered Users</h3>
                            <p className="text-xs text-muted">Latest accounts provisioned across all roles.</p>
                        </div>
                        <Link
                            to="/admin/users"
                            className="text-xs font-bold text-brand-accent hover:underline flex items-center gap-0.5"
                        >
                            Manage accounts <ArrowUpRight className="h-3 w-3" />
                        </Link>
                    </div>

                    {stats.recentUsers.length === 0 ? (
                        <p className="text-xs text-muted py-8 text-center">No users found.</p>
                    ) : (
                        <div className="divide-y divide-ui-border">
                            {stats.recentUsers.map((user) => (
                                <div key={user.userId} className="py-3 flex items-center justify-between gap-3">
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-xs font-bold text-brand-primary truncate">{user.fullName}</p>
                                            <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                                                user.role === 'ADMIN'
                                                    ? 'bg-purple-100 text-purple-800'
                                                    : user.role === 'ORGANIZER'
                                                        ? 'bg-amber-100 text-amber-800'
                                                        : 'bg-blue-100 text-brand-primary'
                                            }`}>
                        {user.role}
                      </span>
                                        </div>
                                        <p className="text-[11px] text-muted truncate mt-0.5">{user.email}</p>
                                    </div>

                                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#F4F5F7] text-muted text-[10px] font-bold">
                                        {user.fullName.charAt(0)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

        </main>
    );
}
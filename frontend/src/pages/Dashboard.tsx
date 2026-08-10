import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    Search,
    Calendar,
    MapPin,
    Users,
    Plus,
    CheckCircle2,
    XCircle,
    Sparkles,
    LogOut,
    Settings,
    X,
    Filter,
    Building,
    Check,
    AlertCircle,
    Info,
    Share2
} from 'lucide-react';
import axiosClient from '../services/axiosClient';
import type { UserProfile, CampusEvent } from '../types/apiResponses';
import Footer from '../components/Footer';
import cputIcon from '../assets/cput-icon.jpg';

type CategoryType = 'ALL' | 'ACADEMIC' | 'SOCIAL' | 'SPORTS' | 'CULTURE' | 'WORKSHOP' | 'CAREER';
type StatusFilterType = 'APPROVED' | 'PENDING' | 'ALL';

export default function Dashboard() {
    const navigate = useNavigate();

    // User State
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loadingUser, setLoadingUser] = useState(true);

    // Events State
    const [events, setEvents] = useState<CampusEvent[]>([]);
    const [loadingEvents, setLoadingEvents] = useState(true);

    // Search and Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<CategoryType>('ALL');
    const [statusFilter, setStatusFilter] = useState<StatusFilterType>('APPROVED');
    const [filterMyRsvps, setFilterMyRsvps] = useState(false);

    // RSVP Action Loading Map
    const [rsvpLoading, setRsvpLoading] = useState<Record<string, boolean>>({});

    // Modals
    const [selectedEventDetails, setSelectedEventDetails] = useState<CampusEvent | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Create Form State
    const [createTitle, setCreateTitle] = useState('');
    const [createCategory, setCreateCategory] = useState<CampusEvent['category']>('WORKSHOP');
    const [createDate, setCreateDate] = useState('');
    const [createLocation, setCreateLocation] = useState('');
    const [createCapacity, setCreateCapacity] = useState<number | ''>(50);
    const [createDescription, setCreateDescription] = useState('');
    const [createImageUrl, setCreateImageUrl] = useState('');
    const [submittingEvent, setSubmittingEvent] = useState(false);

    // Fetch Current User Profile
    const fetchUserProfile = useCallback(async () => {
        try {
            const response = await axiosClient.get<UserProfile>('/api/users/me');
            setUser(response.data);
        } catch {
            toast.error('Session expired. Please log in again.');
            localStorage.removeItem('token');
            sessionStorage.removeItem('token');
            navigate('/login');
        } finally {
            setLoadingUser(false);
        }
    }, [navigate]);

    // Fetch Events Feed
    const fetchEvents = useCallback(async () => {
        setLoadingEvents(true);
        try {
            const response = await axiosClient.get<CampusEvent[]>('/api/events', {
                params: {
                    search: searchQuery || undefined,
                    category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
                    status: statusFilter !== 'ALL' ? statusFilter : undefined
                }
            });
            setEvents(response.data);
        } catch {
            toast.error('Failed to load campus events.');
        } finally {
            setLoadingEvents(false);
        }
    }, [searchQuery, selectedCategory, statusFilter]);

    useEffect(() => {
        fetchUserProfile();
    }, [fetchUserProfile]);

    useEffect(() => {
        if (user) {
            fetchEvents();
        }
    }, [user, fetchEvents]);

    // Handle RSVP Toggle
    const handleRsvpToggle = async (eventItem: CampusEvent) => {
        if (!user) return;

        setRsvpLoading((prev) => ({ ...prev, [eventItem.id]: true }));

        try {
            const response = await axiosClient.post<{ message: string; event: CampusEvent }>(
                `/api/events/${eventItem.id}/rsvp`
            );

            toast.success(response.data.message);

            // Update event in local list
            setEvents((prev) =>
                prev.map((e) => (e.id === eventItem.id ? response.data.event : e))
            );

            if (selectedEventDetails && selectedEventDetails.id === eventItem.id) {
                setSelectedEventDetails(response.data.event);
            }
        } catch (err: unknown) {
            if (
                typeof err === 'object' &&
                err !== null &&
                'response' in err &&
                (err as { response?: { data?: { message?: string } } }).response?.data?.message
            ) {
                toast.error((err as { response: { data: { message: string } } }).response.data.message);
            } else {
                toast.error('Failed to update RSVP status.');
            }
        } finally {
            setRsvpLoading((prev) => ({ ...prev, [eventItem.id]: false }));
        }
    };

    // Handle Admin Event Approval / Rejection
    const handleAdminStatusChange = async (eventId: string, newStatus: 'APPROVED' | 'REJECTED') => {
        try {
            const response = await axiosClient.put<CampusEvent>(`/api/events/${eventId}/status`, {
                status: newStatus
            });

            toast.success(`Event request ${newStatus.toLowerCase()} successfully.`);

            setEvents((prev) =>
                prev.map((e) => (e.id === eventId ? response.data : e))
            );

            if (selectedEventDetails && selectedEventDetails.id === eventId) {
                setSelectedEventDetails(response.data);
            }
        } catch {
            toast.error('Failed to update event approval status.');
        }
    };

    // Handle Create Event Submission
    const handleCreateEventSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!createTitle || !createDate || !createLocation || !createCapacity) {
            toast.error('Please fill in all required fields.');
            return;
        }

        setSubmittingEvent(true);
        try {
            const newEventData = {
                title: createTitle,
                category: createCategory,
                date: new Date(createDate).toISOString(),
                location: createLocation,
                capacity: Number(createCapacity),
                description: createDescription,
                imageUrl: createImageUrl || undefined
            };

            await axiosClient.post<CampusEvent>('/api/events', newEventData);

            if (user?.role === 'ADMIN') {
                toast.success('Event created and approved!');
            } else {
                toast.success('Event request submitted for Admin review!');
            }

            // Refresh events feed
            fetchEvents();

            // Reset Form and close modal
            setCreateTitle('');
            setCreateLocation('');
            setCreateDescription('');
            setCreateImageUrl('');
            setCreateCapacity(50);
            setIsCreateModalOpen(false);
        } catch (err: unknown) {
            if (
                typeof err === 'object' &&
                err !== null &&
                'response' in err &&
                (err as { response?: { data?: { message?: string } } }).response?.data?.message
            ) {
                toast.error((err as { response: { data: { message: string } } }).response.data.message);
            } else {
                toast.error('Failed to create event.');
            }
        } finally {
            setSubmittingEvent(false);
        }
    };

    // Handle Logout
    const handleLogout = () => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        toast.success('Logged out successfully');
        navigate('/login');
    };

    // Filtered Events logic
    const filteredEvents = useMemo(() => {
        return events.filter((e) => {
            if (filterMyRsvps && user) {
                if (!e.rsvpUserIds.includes(user.userId)) return false;
            }
            return true;
        });
    }, [events, filterMyRsvps, user]);

    // Analytics summary
    const myRsvpCount = useMemo(() => {
        if (!user) return 0;
        return events.filter((e) => e.rsvpUserIds.includes(user.userId)).length;
    }, [events, user]);

    const pendingApprovalsCount = useMemo(() => {
        return events.filter((e) => e.status === 'PENDING').length;
    }, [events]);

    const categoriesList: { key: CategoryType; label: string }[] = [
        { key: 'ALL', label: 'All Categories' },
        { key: 'WORKSHOP', label: 'Workshops & Tech' },
        { key: 'ACADEMIC', label: 'Academic & Research' },
        { key: 'CAREER', label: 'Career & Expos' },
        { key: 'CULTURE', label: 'Culture & Arts' },
        { key: 'SPORTS', label: 'Sports & Derby' },
        { key: 'SOCIAL', label: 'Social Gatherings' }
    ];

    if (loadingUser) {
        return (
            <div className="min-h-screen bg-app flex flex-col items-center justify-center p-6">
                <div className="w-12 h-12 border-4 border-brand-primary border-t-brand-accent rounded-full animate-spin mb-4" />
                <p className="text-brand-primary font-medium">Loading CPUT Campus Connect Hub...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-app flex flex-col font-brand text-brand-primary">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-30 bg-white border-b border-ui-border shadow-subtle">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    {/* Brand Logo */}
                    <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/dashboard')}>
                        <img
                            src={cputIcon}
                            alt="CPUT Logo"
                            className="h-9 w-auto object-contain rounded-sm"
                        />
                        <div>
                            <span className="font-extrabold text-lg text-brand-primary tracking-tight block leading-none">
                                Campus<span className="text-brand-accent">Connect</span>
                            </span>
                            <span className="text-[10px] font-semibold tracking-wider text-muted uppercase">
                                Cape Peninsula University of Technology
                            </span>
                        </div>
                    </div>

                    {/* Navigation Actions */}
                    <div className="flex items-center space-x-3 sm:space-x-4">
                        {(user?.role === 'ORGANIZER' || user?.role === 'ADMIN') && (
                            <button
                                onClick={() => setIsCreateModalOpen(true)}
                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-brand bg-brand-primary text-white font-semibold text-xs sm:text-sm hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
                            >
                                <Plus className="w-4 h-4 text-brand-accent" />
                                <span className="hidden xs:inline">Host Event</span>
                            </button>
                        )}

                        <Link
                            to="/settings"
                            className="p-2 rounded-brand border border-ui-border text-slate-600 hover:text-brand-primary hover:bg-slate-50 transition-colors cursor-pointer"
                            title="Profile Settings"
                        >
                            <Settings className="w-4 h-4" />
                        </Link>

                        {/* User Badge Pill */}
                        <div className="hidden md:flex items-center gap-2 pl-2 border-l border-ui-border">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-xs text-brand-primary">
                                {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div className="text-left leading-tight">
                                <span className="text-xs font-bold block truncate max-w-[120px]">
                                    {user?.fullName}
                                </span>
                                <span
                                    className={`inline-block text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                                        user?.role === 'ADMIN'
                                            ? 'bg-purple-100 text-purple-800'
                                            : user?.role === 'ORGANIZER'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-emerald-100 text-emerald-800'
                                    }`}
                                >
                                    {user?.role}
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="p-2 rounded-brand text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Logout"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
                {/* Hero / Overview Welcome Card */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-oxford-blue via-slate-900 to-oxford-blue text-white p-6 sm:p-8 shadow-md">
                    <div className="relative z-10 max-w-3xl space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-solar-orange text-xs font-semibold">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Centralized CPUT Event & Capacity Hub</span>
                        </div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                            Welcome back, {user?.fullName}!
                        </h1>
                        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                            Discover academic workshops, cultural festivals, career expos, and campus sports derby events. Register in 1-click with real-time venue capacity tracking.
                        </p>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10">
                            <div className="bg-white/5 rounded-xl p-3 backdrop-blur-sm border border-white/10">
                                <span className="text-xs text-slate-300 font-medium block">Total Upcoming</span>
                                <span className="text-xl sm:text-2xl font-bold text-white">{events.length}</span>
                            </div>
                            <div className="bg-white/5 rounded-xl p-3 backdrop-blur-sm border border-white/10">
                                <span className="text-xs text-slate-300 font-medium block">My RSVPs</span>
                                <span className="text-xl sm:text-2xl font-bold text-solar-orange">{myRsvpCount}</span>
                            </div>
                            <div className="bg-white/5 rounded-xl p-3 backdrop-blur-sm border border-white/10">
                                <span className="text-xs text-slate-300 font-medium block">My Role</span>
                                <span className="text-sm font-bold text-emerald-400 uppercase mt-1 block">
                                    {user?.role}
                                </span>
                            </div>
                            {user?.role === 'ADMIN' ? (
                                <div className="bg-white/5 rounded-xl p-3 backdrop-blur-sm border border-white/10">
                                    <span className="text-xs text-slate-300 font-medium block">Pending Requests</span>
                                    <span className="text-xl sm:text-2xl font-bold text-amber-400">
                                        {pendingApprovalsCount}
                                    </span>
                                </div>
                            ) : (
                                <div className="bg-white/5 rounded-xl p-3 backdrop-blur-sm border border-white/10">
                                    <span className="text-xs text-slate-300 font-medium block">Active Campuses</span>
                                    <span className="text-sm font-bold text-white mt-1 block">D6, Bellville & More</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Filter & Search Toolbar */}
                <div className="bg-card rounded-xl p-4 sm:p-5 border border-ui-border shadow-subtle space-y-4">
                    {/* Top Control Bar: Search & Quick Toggle */}
                    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                        {/* Search Input */}
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by title, campus location, speaker or club..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-brand bg-slate-50 border border-ui-border text-sm text-brand-primary placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:bg-white transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Status Filters & RSVP Filter */}
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Filter My RSVPs toggle */}
                            <button
                                onClick={() => setFilterMyRsvps(!filterMyRsvps)}
                                className={`px-3 py-2 rounded-brand text-xs font-bold transition-all border cursor-pointer ${
                                    filterMyRsvps
                                        ? 'bg-solar-orange text-slate-900 border-solar-orange shadow-sm'
                                        : 'bg-white text-slate-600 border-ui-border hover:bg-slate-50'
                                }`}
                            >
                                {filterMyRsvps ? '✓ My Registered RSVPs' : 'Filter My RSVPs'}
                            </button>

                            {/* RBAC Status Tab selection for Admin / Organizer */}
                            {(user?.role === 'ADMIN' || user?.role === 'ORGANIZER') && (
                                <div className="inline-flex rounded-brand p-1 bg-slate-100 border border-ui-border text-xs font-semibold">
                                    <button
                                        onClick={() => setStatusFilter('APPROVED')}
                                        className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                                            statusFilter === 'APPROVED'
                                                ? 'bg-white text-brand-primary shadow-xs'
                                                : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        Approved
                                    </button>
                                    <button
                                        onClick={() => setStatusFilter('PENDING')}
                                        className={`px-2.5 py-1 rounded transition-all relative cursor-pointer ${
                                            statusFilter === 'PENDING'
                                                ? 'bg-white text-brand-primary shadow-xs'
                                                : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        Pending
                                        {pendingApprovalsCount > 0 && (
                                            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[9px] font-extrabold">
                                                {pendingApprovalsCount}
                                            </span>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => setStatusFilter('ALL')}
                                        className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
                                            statusFilter === 'ALL'
                                                ? 'bg-white text-brand-primary shadow-xs'
                                                : 'text-slate-600 hover:text-slate-900'
                                        }`}
                                    >
                                        All Status
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Category Scroll Pills */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
                        <span className="text-xs font-bold text-slate-400 flex items-center gap-1 shrink-0 pr-1">
                            <Filter className="w-3.5 h-3.5" /> Category:
                        </span>
                        {categoriesList.map((cat) => (
                            <button
                                key={cat.key}
                                onClick={() => setSelectedCategory(cat.key)}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                                    selectedCategory === cat.key
                                        ? 'bg-brand-primary text-white shadow-xs'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Event Feed Section Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-extrabold text-brand-primary tracking-tight">
                            Campus Events & Workshops
                        </h2>
                        <p className="text-xs text-muted">
                            Showing {filteredEvents.length} upcoming events
                            {selectedCategory !== 'ALL' ? ` in ${selectedCategory}` : ''}
                        </p>
                    </div>

                    {(user?.role === 'ORGANIZER' || user?.role === 'ADMIN') && (
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-brand bg-slate-100 text-brand-primary font-bold text-xs hover:bg-slate-200 transition-colors cursor-pointer"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Create Event</span>
                        </button>
                    )}
                </div>

                {/* Events Cards Grid */}
                {loadingEvents ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 py-8">
                        {[1, 2, 3, 4, 5, 6].map((idx) => (
                            <div key={idx} className="bg-white rounded-xl h-96 border border-ui-border animate-pulse p-4 space-y-4">
                                <div className="h-40 bg-slate-200 rounded-lg" />
                                <div className="h-4 bg-slate-200 rounded w-3/4" />
                                <div className="h-3 bg-slate-200 rounded w-1/2" />
                                <div className="h-16 bg-slate-100 rounded" />
                            </div>
                        ))}
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="bg-card rounded-2xl p-12 text-center border border-ui-border shadow-subtle space-y-4 max-w-md mx-auto">
                        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                            <Calendar className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-bold text-brand-primary">No events found</h3>
                        <p className="text-xs text-muted leading-relaxed">
                            We couldn&apos;t find any events matching your search or category filters. Try clearing filters or hosting a new event!
                        </p>
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedCategory('ALL');
                                setFilterMyRsvps(false);
                                setStatusFilter('APPROVED');
                            }}
                            className="px-4 py-2 rounded-brand bg-brand-primary text-white font-semibold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                            Reset All Filters
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredEvents.map((eventItem) => {
                            const isUserRsvpd = user ? eventItem.rsvpUserIds.includes(user.userId) : false;
                            const isFull = eventItem.currentRSVPs >= eventItem.capacity;
                            const capacityPercent = Math.min(
                                100,
                                Math.round((eventItem.currentRSVPs / eventItem.capacity) * 100)
                            );
                            const spotsLeft = Math.max(0, eventItem.capacity - eventItem.currentRSVPs);

                            const eventDate = new Date(eventItem.date);
                            const formattedDate = eventDate.toLocaleDateString('en-ZA', {
                                weekday: 'short',
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                            });
                            const formattedTime = eventDate.toLocaleTimeString('en-ZA', {
                                hour: '2-digit',
                                minute: '2-digit'
                            });

                            return (
                                <div
                                    key={eventItem.id}
                                    className="bg-card rounded-2xl border border-ui-border overflow-hidden shadow-subtle hover:shadow-md transition-all flex flex-col justify-between group"
                                >
                                    {/* Event Card Header Image & Badges */}
                                    <div>
                                        <div className="relative h-48 w-full overflow-hidden bg-slate-800">
                                            <img
                                                src={
                                                    eventItem.imageUrl ||
                                                    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'
                                                }
                                                alt={eventItem.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-black/20" />

                                            {/* Category Tag */}
                                            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-wider border border-white/20">
                                                {eventItem.category}
                                            </span>

                                            {/* Status Badge (if Pending/Rejected or Admin view) */}
                                            {eventItem.status !== 'APPROVED' && (
                                                <span
                                                    className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-md ${
                                                        eventItem.status === 'PENDING'
                                                            ? 'bg-amber-500/90 text-white'
                                                            : 'bg-rose-500/90 text-white'
                                                    }`}
                                                >
                                                    {eventItem.status}
                                                </span>
                                            )}

                                            {/* Capacity Status Overlay */}
                                            <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-semibold">
                                                <span className="flex items-center gap-1 text-slate-200 text-[11px]">
                                                    <Building className="w-3.5 h-3.5 text-solar-orange" />
                                                    <span className="truncate max-w-[180px]">{eventItem.organizerName}</span>
                                                </span>
                                                <span
                                                    className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                                                        isFull
                                                            ? 'bg-rose-600 text-white'
                                                            : spotsLeft <= 5
                                                                ? 'bg-amber-500 text-slate-900'
                                                                : 'bg-emerald-600 text-white'
                                                    }`}
                                                >
                                                    {isFull ? 'FULL' : `${spotsLeft} Spots Left`}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Content Body */}
                                        <div className="p-5 space-y-3">
                                            <h3 className="font-bold text-base text-brand-primary line-clamp-2 leading-snug group-hover:text-slate-700 transition-colors">
                                                {eventItem.title}
                                            </h3>

                                            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                                                {eventItem.description}
                                            </p>

                                            {/* Date, Time & Venue */}
                                            <div className="space-y-1.5 pt-1 text-xs text-slate-600">
                                                <div className="flex items-center gap-2">
                                                    <Calendar className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                                                    <span className="font-medium text-slate-800">
                                                        {formattedDate} at {formattedTime}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                                    <span className="truncate font-medium text-slate-700">
                                                        {eventItem.location}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Automated Venue Capacity Meter */}
                                            <div className="pt-2 space-y-1">
                                                <div className="flex items-center justify-between text-[11px] font-bold">
                                                    <span className="text-slate-500 flex items-center gap-1">
                                                        <Users className="w-3 h-3 text-slate-400" /> Venue Capacity:
                                                    </span>
                                                    <span className={isFull ? 'text-rose-600 font-extrabold' : 'text-slate-800'}>
                                                        {eventItem.currentRSVPs} / {eventItem.capacity} ({capacityPercent}%)
                                                    </span>
                                                </div>

                                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                                                    <div
                                                        className={`h-full transition-all duration-500 rounded-full ${
                                                            isFull
                                                                ? 'bg-rose-500'
                                                                : capacityPercent >= 85
                                                                    ? 'bg-amber-500'
                                                                    : 'bg-emerald-500'
                                                        }`}
                                                        style={{ width: `${capacityPercent}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Footer */}
                                    <div className="p-4 bg-slate-50 border-t border-ui-border flex items-center gap-2">
                                        <button
                                            onClick={() => setSelectedEventDetails(eventItem)}
                                            className="px-3 py-2 rounded-brand border border-ui-border text-slate-700 bg-white hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
                                            title="View Details"
                                        >
                                            Details
                                        </button>

                                        {/* Admin Pending Request Action Buttons */}
                                        {user?.role === 'ADMIN' && eventItem.status === 'PENDING' ? (
                                            <div className="flex-1 flex gap-1.5">
                                                <button
                                                    onClick={() => handleAdminStatusChange(eventItem.id, 'APPROVED')}
                                                    className="flex-1 py-2 px-2 rounded-brand bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                                                >
                                                    <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                                                </button>
                                                <button
                                                    onClick={() => handleAdminStatusChange(eventItem.id, 'REJECTED')}
                                                    className="py-2 px-2.5 rounded-brand bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer"
                                                    title="Reject"
                                                >
                                                    <XCircle className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ) : (
                                            /* Automated 1-Click RSVP Flow */
                                            <button
                                                onClick={() => handleRsvpToggle(eventItem)}
                                                disabled={rsvpLoading[eventItem.id] || (isFull && !isUserRsvpd)}
                                                className={`flex-1 py-2 px-3 rounded-brand text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed ${
                                                    isUserRsvpd
                                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                                                        : isFull
                                                            ? 'bg-slate-200 text-slate-400 border border-slate-300'
                                                            : 'bg-brand-primary text-white hover:bg-slate-800 shadow-xs'
                                                }`}
                                            >
                                                {rsvpLoading[eventItem.id] ? (
                                                    <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                ) : isUserRsvpd ? (
                                                    <>
                                                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                                                        <span>RSVP&apos;d (Click to Cancel)</span>
                                                    </>
                                                ) : isFull ? (
                                                    <>
                                                        <AlertCircle className="w-3.5 h-3.5" />
                                                        <span>Venue Capacity Full</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Sparkles className="w-3.5 h-3.5 text-solar-orange" />
                                                        <span>1-Click RSVP</span>
                                                    </>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Event Details Modal */}
            {selectedEventDetails && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-2xl w-full border border-ui-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
                        {/* Header Image */}
                        <div className="relative h-64 w-full bg-slate-900">
                            <img
                                src={
                                    selectedEventDetails.imageUrl ||
                                    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=800&q=80'
                                }
                                alt={selectedEventDetails.title}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                            <button
                                onClick={() => setSelectedEventDetails(null)}
                                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="absolute bottom-4 left-6 right-6 text-white space-y-1">
                                <span className="inline-block px-2.5 py-0.5 rounded-full bg-solar-orange text-slate-900 text-[10px] font-extrabold uppercase">
                                    {selectedEventDetails.category}
                                </span>
                                <h2 className="text-xl sm:text-2xl font-extrabold leading-tight">
                                    {selectedEventDetails.title}
                                </h2>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6 space-y-6">
                            {/* Key Stats Bar */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-50 border border-ui-border">
                                <div>
                                    <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Date & Time</span>
                                    <span className="text-xs font-bold text-brand-primary block mt-0.5">
                                        {new Date(selectedEventDetails.date).toLocaleString('en-ZA', {
                                            dateStyle: 'medium',
                                            timeStyle: 'short'
                                        })}
                                    </span>
                                </div>
                                <div>
                                    <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Campus Venue</span>
                                    <span className="text-xs font-bold text-brand-primary block mt-0.5 truncate">
                                        {selectedEventDetails.location}
                                    </span>
                                </div>
                                <div className="col-span-2 sm:col-span-1">
                                    <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Organizer</span>
                                    <span className="text-xs font-bold text-brand-primary block mt-0.5 truncate">
                                        {selectedEventDetails.organizerName}
                                    </span>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <h3 className="text-sm font-bold text-brand-primary flex items-center gap-1.5">
                                    <Info className="w-4 h-4 text-brand-primary" /> Event Description
                                </h3>
                                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                                    {selectedEventDetails.description}
                                </p>
                            </div>

                            {/* Automated Capacity Tracking */}
                            <div className="p-4 rounded-xl border border-ui-border space-y-2">
                                <div className="flex items-center justify-between text-xs font-bold">
                                    <span className="text-slate-600 flex items-center gap-1.5">
                                        <Users className="w-4 h-4 text-brand-primary" /> Venue Capacity & RSVP Status
                                    </span>
                                    <span className="text-brand-primary font-extrabold">
                                        {selectedEventDetails.currentRSVPs} / {selectedEventDetails.capacity} Seats Filled
                                    </span>
                                </div>
                                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
                                    <div
                                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                                        style={{
                                            width: `${Math.min(
                                                100,
                                                (selectedEventDetails.currentRSVPs / selectedEventDetails.capacity) * 100
                                            )}%`
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-4 bg-slate-50 border-t border-ui-border flex items-center justify-between gap-3">
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(window.location.href);
                                    toast.success('Event link copied to clipboard!');
                                }}
                                className="px-3.5 py-2 rounded-brand border border-ui-border bg-white text-slate-700 font-semibold text-xs hover:bg-slate-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                            >
                                <Share2 className="w-3.5 h-3.5" /> Share
                            </button>

                            <button
                                onClick={() => handleRsvpToggle(selectedEventDetails)}
                                disabled={
                                    rsvpLoading[selectedEventDetails.id] ||
                                    (selectedEventDetails.currentRSVPs >= selectedEventDetails.capacity &&
                                        !selectedEventDetails.rsvpUserIds.includes(user?.userId || ''))
                                }
                                className={`px-6 py-2.5 rounded-brand text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                                    user && selectedEventDetails.rsvpUserIds.includes(user.userId)
                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                        : 'bg-brand-primary text-white hover:bg-slate-800'
                                }`}
                            >
                                {user && selectedEventDetails.rsvpUserIds.includes(user.userId) ? (
                                    <>
                                        <Check className="w-4 h-4 text-emerald-600" />
                                        <span>Cancel My RSVP</span>
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4 text-solar-orange" />
                                        <span>Confirm 1-Click RSVP</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Create Event Modal (for Organizers & Admins) */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl max-w-xl w-full border border-ui-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
                        <div className="p-6 bg-brand-primary text-white flex items-center justify-between">
                            <div className="space-y-1">
                                <h2 className="text-lg font-bold flex items-center gap-2">
                                    <Plus className="w-5 h-5 text-solar-orange" /> Host a New Campus Event
                                </h2>
                                <p className="text-xs text-slate-300">
                                    {user?.role === 'ADMIN'
                                        ? 'Publish directly to the student campus feed.'
                                        : 'Submit your club or faculty event request for Administrator approval.'}
                                </p>
                            </div>
                            <button
                                onClick={() => setIsCreateModalOpen(false)}
                                className="text-slate-300 hover:text-white p-1 rounded-full cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleCreateEventSubmit} className="p-6 space-y-4">
                            {/* Title */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Event Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={createTitle}
                                    onChange={(e) => setCreateTitle(e.target.value)}
                                    placeholder="e.g. CPUT AI & Robotics Seminar 2026"
                                    className="w-full px-3.5 py-2 rounded-brand bg-slate-50 border border-ui-border text-sm text-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                />
                            </div>

                            {/* Category & Capacity Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Category *
                                    </label>
                                    <select
                                        value={createCategory}
                                        onChange={(e) =>
                                            setCreateCategory(e.target.value as CampusEvent['category'])
                                        }
                                        className="w-full px-3.5 py-2 rounded-brand bg-slate-50 border border-ui-border text-sm text-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                    >
                                        <option value="WORKSHOP">Workshops & Tech</option>
                                        <option value="ACADEMIC">Academic & Research</option>
                                        <option value="CAREER">Career & Expos</option>
                                        <option value="CULTURE">Culture & Arts</option>
                                        <option value="SPORTS">Sports & Derby</option>
                                        <option value="SOCIAL">Social Gatherings</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Venue Max Capacity *
                                    </label>
                                    <input
                                        type="number"
                                        required
                                        min={5}
                                        max={2000}
                                        value={createCapacity}
                                        onChange={(e) =>
                                            setCreateCapacity(e.target.value ? Number(e.target.value) : '')
                                        }
                                        className="w-full px-3.5 py-2 rounded-brand bg-slate-50 border border-ui-border text-sm text-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                    />
                                </div>
                            </div>

                            {/* Date & Location Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Date & Time *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={createDate}
                                        onChange={(e) => setCreateDate(e.target.value)}
                                        className="w-full px-3.5 py-2 rounded-brand bg-slate-50 border border-ui-border text-sm text-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">
                                        Campus Location / Venue *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={createLocation}
                                        onChange={(e) => setCreateLocation(e.target.value)}
                                        placeholder="e.g. District Six Engineering Auditorium"
                                        className="w-full px-3.5 py-2 rounded-brand bg-slate-50 border border-ui-border text-sm text-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Description & Details
                                </label>
                                <textarea
                                    rows={3}
                                    value={createDescription}
                                    onChange={(e) => setCreateDescription(e.target.value)}
                                    placeholder="Provide key details, prerequisites, speaker information, or agenda..."
                                    className="w-full px-3.5 py-2 rounded-brand bg-slate-50 border border-ui-border text-sm text-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary resize-none"
                                />
                            </div>

                            {/* Image URL */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 mb-1">
                                    Banner Cover Image URL (Optional)
                                </label>
                                <input
                                    type="url"
                                    value={createImageUrl}
                                    onChange={(e) => setCreateImageUrl(e.target.value)}
                                    placeholder="https://images.unsplash.com/..."
                                    className="w-full px-3.5 py-2 rounded-brand bg-slate-50 border border-ui-border text-sm text-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary"
                                />
                            </div>

                            {/* Submit Actions */}
                            <div className="pt-4 flex items-center justify-end gap-3 border-t border-ui-border">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-4 py-2 rounded-brand border border-ui-border text-slate-600 font-semibold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submittingEvent}
                                    className="px-5 py-2 rounded-brand bg-brand-primary text-white font-bold text-xs hover:bg-slate-800 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
                                >
                                    {submittingEvent
                                        ? 'Submitting...'
                                        : user?.role === 'ADMIN'
                                            ? 'Publish Event'
                                            : 'Submit for Approval'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Footer */}
            <Footer />
        </div>
    );
}

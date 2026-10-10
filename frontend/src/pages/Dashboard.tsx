import { useState, useEffect } from 'react';
import {
    Search,
    Calendar,
    MapPin,
    Users,
    Plus,
    CheckCircle2,
    Clock,
    Filter,
} from 'lucide-react';
import {Link, useOutletContext} from 'react-router-dom';
import axiosClient from '../services/axiosClient';
import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import type { UserProfile } from '../types/apiResponses';

interface CampusEvent {
    id: string;
    title: string;
    description: string;
    category: string;
    campus: string;
    eventDate: string;
    eventTime: string;
    venue: string;
    organizerName: string;
    capacity: number;
    registeredCount: number;
    isRegistered: boolean;
}

interface LayoutContextType {
    user: UserProfile | null;
}

const CATEGORIES = ['All', 'Career', 'Academic', 'Workshop', 'Sports', 'Social'];

const CAMPUS_DISPLAY_NAMES: Record<string, string> = {
    CAPE_TOWN: 'District Six',
    BELLVILLE: 'Bellville',
    GRANGER_BAY: 'Granger Bay',
    MOWBRAY: 'Mowbray',
    WELLINGTON: 'Wellington',
    ATHLONE: 'Athlone',
    ONLINE: 'Online',
};


const CAMPUSES = [
    'All',
    'District Six',
    'Bellville',
    'Granger Bay',
    'Mowbray',
    'Wellington',
    'Athlone',
    'Online',
];



const formatDate = (dateStr: string) => {
    try {
        return new Date(dateStr).toLocaleDateString('en-ZA', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    } catch {
        return dateStr;
    }
};

export default function Dashboard() {
    const { user } = useOutletContext<LayoutContextType>();

    const [events, setEvents] = useState<CampusEvent[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedCampus, setSelectedCampus] = useState('All');
    const [loadingEvents, setLoadingEvents] = useState(true);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await axiosClient.get<CampusEvent[]>('/api/events');
                setEvents(response.data);
            } catch (err) {
                if (isAxiosError(err) && [401, 403].includes(err.response?.status ?? 0)) {
                    toast.error('Session expired. Please log in again.');
                    return;
                }
                toast.error('Unable to load events. Please try again later.');
            } finally {
                setLoadingEvents(false);
            }
        };

        fetchEvents();
    }, []);

    const handleRsvp = async (eventId: string) => {
        if (user?.role !== 'STUDENT') {
            toast.error('Only students can RSVP to events.');
            return;
        }

        const eventToUpdate = events.find((event) => event.id === eventId);
        if (!eventToUpdate) return;

        const currentCount = eventToUpdate.registeredCount;
        if (!eventToUpdate.isRegistered && currentCount >= eventToUpdate.capacity) {
            toast.error('This event is fully booked.');
            return;
        }

        try {
            const response = eventToUpdate.isRegistered
                ? await axiosClient.delete<CampusEvent>(`/api/events/${eventId}/rsvp`)
                : await axiosClient.post<CampusEvent>(`/api/events/${eventId}/rsvp`);

            setEvents((prev) => prev.map((e) => (e.id === eventId ? response.data : e)));
            toast.success(
                eventToUpdate.isRegistered
                    ? `Cancelled registration for: ${eventToUpdate.title}`
                    : `Successfully RSVP'd for: ${eventToUpdate.title}`
            );
        } catch (err: unknown) {
            const message = isAxiosError<{ message?: string }>(err)
                ? err.response?.data?.message || 'Unable to update your RSVP.'
                : 'Unable to update your RSVP.';
            toast.error(message);
        }
    };

    const filteredEvents = events.filter((event) => {
        const matchesCategory =
            selectedCategory === 'All' ||
            event.category?.toLowerCase() === selectedCategory.toLowerCase();

        const matchesCampus =
            selectedCampus === 'All' ||
            CAMPUS_DISPLAY_NAMES[event.campus]?.toLowerCase() === selectedCampus.toLowerCase();

        const matchesSearch =
            event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
            event.description.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesCategory && matchesCampus && matchesSearch;
    });

    return (
        <div className="flex min-h-screen flex-col bg-app font-brand text-primary">
            <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">

                {/* Hero / Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-extrabold text-brand-primary sm:text-3xl">
                            Upcoming Campus Events
                        </h1>
                        <p className="mt-1 text-sm text-muted">
                            Discover workshops, academic sessions, and social activities across all CPUT campuses.
                        </p>
                    </div>

                    {/* Organizer / Admin Action Button */}
                    {(user?.role === 'ORGANIZER' || user?.role === 'ADMIN') && (
                        <Link
                            to="/events/create"
                            className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:opacity-90 transition-opacity self-start sm:self-auto"
                        >
                            <Plus className="h-4 w-4" />
                            Create New Event
                        </Link>
                    )}
                </div>

                <div className="mb-8 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Search Input */}
                        <div className="relative flex-1">
                            <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by event title, venue, or keyword..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full rounded-lg border border-ui-border bg-card py-2.5 pl-10 pr-4 text-sm text-primary placeholder:text-muted focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary shadow-subtle"
                            />
                        </div>

                        {/* Campus Filter Dropdown */}
                        <select
                            value={selectedCampus}
                            onChange={(e) => setSelectedCampus(e.target.value)}
                            className="rounded-lg border border-ui-border bg-card px-4 py-2.5 text-xs font-bold text-brand-primary shadow-subtle focus:border-brand-primary focus:outline-none focus:ring-1 focus:ring-brand-primary cursor-pointer"
                        >
                            {CAMPUSES.map((camp) => (
                                <option key={camp} value={camp}>
                                    {camp === 'All' ? 'All Campuses' : `${camp} Campus`}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Category Tabs */}
                    <div className="flex flex-wrap gap-2 pt-1">
                        {CATEGORIES.map((category) => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                                    selectedCategory.toLowerCase() === category.toLowerCase()
                                        ? 'bg-brand-primary text-white shadow-sm'
                                        : 'bg-card text-muted border border-ui-border hover:bg-gray-100'
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Event Cards Grid */}
                {loadingEvents ? (
                    <div className="py-16 text-center text-sm font-semibold text-muted">
                        Loading upcoming events...
                    </div>
                ) : filteredEvents.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-ui-border bg-card py-16 text-center">
                        <Filter className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                        <p className="text-sm font-bold text-brand-primary">No events found</p>
                        <p className="text-xs text-muted mt-1">
                            {selectedCampus !== 'All' || selectedCategory !== 'All'
                                ? `No events match your current filters.`
                                : 'Try adjusting your search terms.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredEvents.map((event) => {
                            const registeredCount = event.registeredCount;
                            const isFull = registeredCount >= event.capacity;
                            const capacityPercent = Math.min(100, Math.round((registeredCount / event.capacity) * 100));

                            return (
                                <div
                                    key={event.id}
                                    className="flex flex-col justify-between rounded-2xl border border-ui-border bg-card p-6 shadow-subtle hover:shadow-md transition-shadow"
                                >
                                    <div>
                                        {/* Top Row: Category Tag & Date */}
                                        <div className="flex items-center justify-between gap-2 mb-3">
                                            {/* Fixed typo: removed stray 'f' */}
                                            <span className="rounded-md bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-brand-primary uppercase tracking-wide">
                                                {event.category}
                                            </span>
                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted">
                                                <Calendar className="h-3.5 w-3.5 text-brand-accent" />
                                                {formatDate(event.eventDate)}
                                            </div>
                                        </div>

                                        {/* Title & Description */}
                                        <Link to={`/events/${event.id}`}>
                                            <h3 className="text-lg font-bold text-brand-primary line-clamp-1 mb-2 hover:underline cursor-pointer">
                                                {event.title}
                                            </h3>
                                        </Link>
                                        <p className="text-xs text-muted line-clamp-2 mb-4 leading-relaxed">
                                            {event.description}
                                        </p>

                                        {/* Metadata (Time, Campus & Venue, Organizer) */}
                                        <div className="space-y-1.5 text-xs text-muted mb-5 border-t border-ui-border pt-4">
                                            <div className="flex items-center gap-2">
                                                <Clock className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                                <span>{event.eventTime}</span>
                                            </div>

                                            {/* Campus Badge */}
                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted">
                                                <MapPin className="h-3.5 w-3.5 text-brand-accent" />
                                                <span>{CAMPUS_DISPLAY_NAMES[event.campus] || event.campus}</span>
                                            </div>

                                            {/* Venue / Room */}
                                            <div className="flex items-center gap-2">
                                                <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                                <span className="truncate">{event.venue}</span>
                                            </div>

                                            {/* Organizer */}
                                            <div className="flex items-center gap-2">
                                                <Users className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                                <span>Organized by {event.organizerName}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom: Capacity Bar & Action Button */}
                                    <div>
                                        {/* Capacity Indicator */}
                                        <div className="mb-4">
                                            <div className="flex justify-between text-[10px] font-semibold text-muted mb-1.5">
                                                <span>Capacity</span>
                                                <span className={isFull ? 'text-red-500 font-bold' : ''}>
                                                    {registeredCount} / {event.capacity} booked
                                                </span>
                                            </div>
                                            <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all ${
                                                        isFull ? 'bg-red-500' : capacityPercent > 80 ? 'bg-amber-400' : 'bg-brand-primary'
                                                    }`}
                                                    style={{ width: `${capacityPercent}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Non-students see a disabled notice */}
                                        {user?.role !== 'STUDENT' ? (
                                            <div className="w-full rounded-lg bg-gray-100 py-2.5 text-center text-xs font-bold text-gray-400">
                                                Only students can RSVP
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleRsvp(event.id)}
                                                disabled={isFull && !event.isRegistered}
                                                className={`w-full py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:cursor-not-allowed ${
                                                    event.isRegistered
                                                        ? 'border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                                        : isFull
                                                            ? 'bg-gray-100 text-gray-400'
                                                            : 'bg-brand-primary text-white hover:opacity-90 active:scale-[0.99]'
                                                }`}
                                            >
                                                {event.isRegistered ? (
                                                    <>
                                                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                                        Registered (Click to cancel)
                                                    </>
                                                ) : isFull ? (
                                                    'Event Full'
                                                ) : (
                                                    'RSVP Now'
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
        </div>
    );
}
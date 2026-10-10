import { useEffect, useState } from 'react';
import {
    Calendar,
    Search,
    Trash2,
    ArrowLeft,
    Eye,
    Building2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { isAxiosError } from 'axios';
import axiosClient from '../services/axiosClient';
import type { BackendErrorResponse } from '../types/apiResponses';
import toast from 'react-hot-toast';

interface AdminEventItem {
    id: string;
    title: string;
    description: string;
    category: string;
    campus?: string;
    eventDate: string;
    eventTime: string;
    venue: string;
    capacity: number;
    registeredCount: number;
    organizerName: string;
    organizerEmail: string;
}

const CAMPUS_LABELS: Record<string, string> = {
    ALL: 'All Campuses',
    CAPE_TOWN: 'District Six',
    BELLVILLE: 'Bellville',
    GRANGER_BAY: 'Granger Bay',
    MOWBRAY: 'Mowbray',
    WELLINGTON: 'Wellington',
    ATHLONE: 'Athlone',
    ONLINE: 'Online',
};

const CATEGORIES = ['ALL', 'ACADEMIC', 'CAREER', 'SPORTS', 'WORKSHOP', 'SOCIAL'];

export default function AdminEvents() {
    const [events, setEvents] = useState<AdminEventItem[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCampus, setSelectedCampus] = useState('ALL');
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await axiosClient.get<AdminEventItem[]>('/api/admin/events');
                setEvents(response.data);
            } catch (err: unknown) {
                toast.error('Unable to load events for moderation.');
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, []);

    // Force-Delete a Policy-Violating Event
    const handleDeleteEvent = async (eventId: string, title: string) => {
        const confirmed = window.confirm(
            `SECURITY ACTION: Force-delete event "${title}"?\n\nThis will permanently delete the event and cancel all student reservations in the database.`
        );
        if (!confirmed) return;

        setDeletingId(eventId);
        try {
            await axiosClient.delete(`/api/admin/events/${eventId}`);
            setEvents((prev) => prev.filter((e) => e.id !== eventId));
            toast.success(`Event "${title}" has been deleted.`);
        } catch (err: unknown) {
            let message = 'Failed to delete event.';
            if (isAxiosError<BackendErrorResponse>(err)) {
                message = err.response?.data?.message || message;
            }
            toast.error(message);
        } finally {
            setDeletingId(null);
        }
    };

    const filteredEvents = events.filter((e) => {
        const matchesSearch =
            e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.organizerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.organizerEmail.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesCampus =
            selectedCampus === 'ALL' || e.campus === selectedCampus;

        const matchesCategory =
            selectedCategory === 'ALL' || e.category?.toUpperCase() === selectedCategory;

        return matchesSearch && matchesCampus && matchesCategory;
    });

    if (loading) {
        return (
            <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-16 text-center text-sm font-semibold text-muted font-brand">
                Loading events for moderation...
            </main>
        );
    }

    return (
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8 font-brand text-primary">

            {/* Header & Breadcrumb */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
                <div>
                    <Link
                        to="/admin/dashboard"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-muted hover:text-brand-primary mb-2 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to System Overview
                    </Link>
                    <h1 className="text-2xl font-black text-brand-primary sm:text-3xl">
                        Event Moderation & Auditing
                    </h1>
                    <p className="mt-1 text-sm text-muted">
                        Inspect all campus activities, verify venue safety, or remove inappropriate content [2].
                    </p>
                </div>

                {/* Global Event Counter Badge */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="rounded-lg bg-purple-50 px-3.5 py-1.5 text-xs font-bold text-purple-800 border border-purple-200">
            {events.length} Total Events Monitored
          </span>
                </div>
            </div>

            {/* Search Bar & Filtering Row */}
            <div className="mb-6 space-y-4">
                <div className="flex flex-col md:flex-row gap-3">

                    {/* Keyword Search */}
                    <div className="relative flex-1">
                        <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by event title, venue, or organizer email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-lg border border-ui-border bg-card py-2.5 pl-10 pr-4 text-sm text-primary placeholder:text-muted focus:ring-1 focus:ring-brand-primary"
                        />
                    </div>

                    {/* Campus Selector Dropdown */}
                    <select
                        value={selectedCampus}
                        onChange={(e) => setSelectedCampus(e.target.value)}
                        className="rounded-lg border border-ui-border bg-card px-3.5 py-2.5 text-xs font-bold text-brand-primary shadow-subtle focus:ring-1 focus:ring-brand-primary cursor-pointer"
                    >
                        {Object.entries(CAMPUS_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>
                                {label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Category Filter Tabs */}
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                                selectedCategory === cat
                                    ? 'bg-brand-primary text-white shadow-sm'
                                    : 'bg-card text-muted border border-ui-border hover:bg-gray-100'
                            }`}
                        >
                            {cat === 'ALL' ? 'All Categories' : cat}
                        </button>
                    ))}
                </div>

                <p className="text-xs font-semibold text-muted">
                    Showing <strong className="text-brand-primary">{filteredEvents.length}</strong> of {events.length} events
                </p>
            </div>

            {/* Events Moderation Table */}
            {filteredEvents.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-ui-border bg-card py-16 text-center">
                    <Calendar className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                    <p className="text-sm font-bold text-brand-primary">No events found</p>
                    <p className="text-xs text-muted mt-1">Try adjusting your keyword search or campus filters.</p>
                </div>
            ) : (
                <div className="rounded-2xl border border-ui-border bg-card shadow-subtle overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                            <tr className="border-b border-ui-border bg-[#F8F9FA] text-[10px] font-bold uppercase tracking-wider text-muted">
                                <th className="py-4 px-6">Event Title & Category</th>
                                <th className="py-4 px-6">Campus & Venue</th>
                                <th className="py-4 px-6">Organizer</th>
                                <th className="py-4 px-6">Date & Time</th>
                                <th className="py-4 px-6">Bookings</th>
                                <th className="py-4 px-6 text-right">Moderation Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-ui-border">
                            {filteredEvents.map((ev) => {
                                const percent = Math.min(100, Math.round((ev.registeredCount / ev.capacity) * 100));

                                return (
                                    <tr key={ev.id} className="hover:bg-gray-50/80 transition-colors">

                                        {/* Title & Category */}
                                        <td className="py-4 px-6 max-w-xs">
                                            <div className="flex items-center gap-1.5 mb-1">
                          <span className="rounded bg-blue-50 px-2 py-0.5 text-[9px] font-bold text-brand-primary uppercase">
                            {ev.category}
                          </span>
                                            </div>
                                            <p className="font-bold text-brand-primary truncate">{ev.title}</p>
                                        </td>

                                        {/* Campus & Venue */}
                                        <td className="py-4 px-6">
                                            <p className="font-semibold text-brand-primary flex items-center gap-1">
                                                <Building2 className="h-3 w-3 text-brand-accent" />
                                                {ev.campus ? CAMPUS_LABELS[ev.campus] || ev.campus : 'District Six'}
                                            </p>
                                            <p className="text-[11px] text-muted truncate mt-0.5">{ev.venue}</p>
                                        </td>

                                        {/* Organizer */}
                                        <td className="py-4 px-6">
                                            <p className="font-bold text-brand-primary">{ev.organizerName}</p>
                                            <p className="text-[11px] text-muted truncate">{ev.organizerEmail}</p>
                                        </td>

                                        {/* Date & Time */}
                                        <td className="py-4 px-6 text-muted font-medium whitespace-nowrap">
                                            <p>{ev.eventDate}</p>
                                            <p className="text-[11px] text-gray-400">{ev.eventTime}</p>
                                        </td>

                                        {/* Capacity Meter */}
                                        <td className="py-4 px-6">
                                            <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                                                <span>{ev.registeredCount}/{ev.capacity}</span>
                                                <span className="text-muted">{percent}%</span>
                                            </div>
                                            <div className="h-1.5 w-24 rounded-full bg-gray-100 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full ${percent > 90 ? 'bg-red-500' : 'bg-brand-primary'}`}
                                                    style={{ width: `${percent}%` }}
                                                />
                                            </div>
                                        </td>

                                        {/* Actions */}
                                        <td className="py-4 px-6 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-1.5">

                                                {/* Inspect Details */}
                                                <Link
                                                    to={`/events/${ev.id}`}
                                                    title="Inspect Event Page"
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-ui-border text-muted hover:text-brand-primary hover:bg-gray-100 transition-colors"
                                                >
                                                    <Eye className="h-3.5 w-3.5" />
                                                </Link>

                                                {/* Force Delete Action */}
                                                <button
                                                    onClick={() => handleDeleteEvent(ev.id, ev.title)}
                                                    disabled={deletingId === ev.id}
                                                    title="Force Delete Inappropriate Event"
                                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50 cursor-pointer"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>

                                            </div>
                                        </td>

                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

        </main>
    );
}
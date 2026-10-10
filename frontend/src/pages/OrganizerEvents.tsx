// src/pages/OrganizerEvents.tsx
import { useEffect, useState } from 'react';
import {
    Calendar,
    Clock,
    MapPin,
    Users,
    Plus,
    BarChart3,
    AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { isAxiosError } from 'axios';
import axiosClient from '../services/axiosClient';
import toast from 'react-hot-toast';

interface ManagedEvent {
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
}

export default function OrganizerEvents() {
    const [events, setEvents] = useState<ManagedEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyEvents = async () => {
            try {
                const response = await axiosClient.get<ManagedEvent[]>('/api/events/my-events');
                setEvents(response.data);
            } catch (err: unknown) {
                const message = isAxiosError<{ message?: string }>(err)
                    ? err.response?.data?.message || 'Unable to load your organized events.'
                    : 'Unable to load your organized events.';
                toast.error(message);
            } finally {
                setLoading(false);
            }
        };

        fetchMyEvents();
    }, []);

    const totalEvents = events.length;
    const totalBookedAttendees = events.reduce((sum, e) => sum + (e.registeredCount || 0), 0);
    const totalCapacity = events.reduce((sum, e) => sum + e.capacity, 0);
    const overallOccupancy = totalCapacity > 0 ? Math.round((totalBookedAttendees / totalCapacity) * 100) : 0;

    return (
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8 font-brand">

            {/* Top Header & Quick Action */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-black text-brand-primary sm:text-3xl">
                        My Organized Events
                    </h1>
                    <p className="mt-1 text-sm text-muted">
                        Manage your published campus activities, track RSVPs, and monitor venue capacity.
                    </p>
                </div>

                <Link
                    to="/events/create"
                    className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:opacity-90 transition-opacity self-start sm:self-auto"
                >
                    <Plus className="h-4 w-4" />
                    Create Another Event
                </Link>
            </div>

            {/* Organizer Summary Stats Bar */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
                <div className="rounded-xl border border-ui-border bg-card p-5 shadow-subtle">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-brand-primary">
                            <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-muted uppercase tracking-wider">Events Hosted</p>
                            <p className="text-2xl font-black text-brand-primary">{totalEvents}</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-ui-border bg-card p-5 shadow-subtle">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                            <Users className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-muted uppercase tracking-wider">Total Booked Students</p>
                            <p className="text-2xl font-black text-brand-primary">{totalBookedAttendees}</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-ui-border bg-card p-5 shadow-subtle">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-brand-accent">
                            <BarChart3 className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-xs font-semibold text-muted uppercase tracking-wider">Average Capacity Filled</p>
                            <p className="text-2xl font-black text-brand-primary">{overallOccupancy}%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Events Feed / List */}
            {loading ? (
                <div className="py-16 text-center text-sm font-semibold text-muted">
                    Loading your events...
                </div>
            ) : events.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-ui-border bg-card py-16 text-center">
                    <AlertCircle className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                    <h3 className="text-base font-bold text-brand-primary">You haven't created any events yet</h3>
                    <p className="text-xs text-muted mt-1 max-w-sm mx-auto mb-6">
                        Get started by creating your first workshop, sports match, or student society gathering.
                    </p>
                    <Link
                        to="/events/create"
                        className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:opacity-90"
                    >
                        <Plus className="h-4 w-4" />
                        Create Event Now
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {events.map((event) => {
                        const isFull = event.registeredCount >= event.capacity;
                        const percent = Math.min(100, Math.round((event.registeredCount / event.capacity) * 100));

                        return (
                            <div
                                key={event.id}
                                className="flex flex-col justify-between rounded-2xl border border-ui-border bg-card p-6 shadow-subtle"
                            >
                                <div>
                                    <div className="flex items-center justify-between gap-2 mb-3">
                                        <span className="rounded-md bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-brand-primary uppercase tracking-wide">
                                            {event.category}
                                        </span>
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted">
                                            <Calendar className="h-3.5 w-3.5 text-brand-accent" />
                                            {event.eventDate}
                                        </div>
                                    </div>

                                    <h3 className="text-lg font-bold text-brand-primary line-clamp-1 mb-2">
                                        {event.title}
                                    </h3>
                                    <p className="text-xs text-muted line-clamp-2 mb-4 leading-relaxed">
                                        {event.description}
                                    </p>

                                    <div className="space-y-1.5 text-xs text-muted mb-5 border-t border-ui-border pt-4">
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                            <span>{event.eventTime}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                                            <span className="truncate">{event.venue}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Capacity & Attendance Tracker */}
                                <div className="border-t border-ui-border pt-4 space-y-3">
                                    <div>
                                        <div className="flex justify-between text-[11px] font-semibold text-muted mb-1.5">
                                            <span>Attendee Sign-ups</span>
                                            <span className={isFull ? 'text-red-500 font-bold' : 'text-brand-primary font-bold'}>
                                                {event.registeredCount} / {event.capacity} ({percent}%)
                                            </span>
                                        </div>

                                        <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${
                                                    isFull ? 'bg-red-500' : percent > 80 ? 'bg-amber-400' : 'bg-brand-primary'
                                                }`}
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Action button linking to /events/:id/manage */}
                                    <Link
                                        to={`/events/${event.id}/manage`}
                                        className="block w-full rounded-lg bg-brand-primary py-2.5 text-center text-xs font-bold text-white shadow-sm hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer"
                                    >
                                        Manage Attendees & Roster
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </main>
    );
}
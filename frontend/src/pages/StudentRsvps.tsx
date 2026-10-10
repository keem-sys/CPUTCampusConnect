import { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin, Users, XCircle } from 'lucide-react';
import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import axiosClient from '../services/axiosClient';

interface RsvpEvent {
    id: string;
    title: string;
    description: string;
    category: string;
    eventDate: string;
    eventTime: string;
    venue: string;
    organizerName: string;
    capacity: number;
    registeredCount: number;
}

export default function StudentRsvps() {
    const [events, setEvents] = useState<RsvpEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState<string | null>(null);

    useEffect(() => {
        const loadRsvps = async () => {
            try {
                const response = await axiosClient.get<RsvpEvent[]>('/api/events/my-rsvps');
                setEvents(response.data);
            } catch (error: unknown) {
                const message = isAxiosError<{ message?: string }>(error)
                    ? error.response?.data?.message || 'Unable to load your RSVPs.'
                    : 'Unable to load your RSVPs.';
                toast.error(message);
            } finally {
                setLoading(false);
            }
        };

        loadRsvps();
    }, []);

    const cancelRsvp = async (eventId: string) => {
        setCancellingId(eventId);
        try {
            await axiosClient.delete(`/api/events/${eventId}/rsvp`);
            setEvents((current) => current.filter((event) => event.id !== eventId));
            toast.success('RSVP cancelled successfully.');
        } catch (error: unknown) {
            const message = isAxiosError<{ message?: string }>(error)
                ? error.response?.data?.message || 'Unable to cancel your RSVP.'
                : 'Unable to cancel your RSVP.';
            toast.error(message);
        } finally {
            setCancellingId(null);
        }
    };

    return (
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
            <div className="mb-8">
                <h1 className="text-2xl font-extrabold text-brand-primary sm:text-3xl">My RSVPs</h1>
                <p className="mt-1 text-sm text-muted">Events you are registered to attend.</p>
            </div>

            {loading ? (
                <div className="py-16 text-center text-sm font-semibold text-muted">Loading your RSVPs...</div>
            ) : events.length === 0 ? (
                <div className="rounded-xl border border-dashed border-ui-border bg-card py-16 text-center">
                    <Calendar className="mx-auto mb-3 h-8 w-8 text-gray-300" />
                    <p className="text-sm font-bold text-brand-primary">No RSVPs yet</p>
                    <p className="mt-1 text-xs text-muted">Explore events and RSVP to see them here.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {events.map((event) => (
                        <article key={event.id} className="flex flex-col justify-between rounded-2xl border border-ui-border bg-card p-6 shadow-subtle">
                            <div>
                                <div className="mb-3 flex items-center justify-between gap-2">
                                    <span className="rounded-md bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-primary">
                                        {event.category}
                                    </span>
                                    <span className="text-xs font-semibold text-muted">{event.eventDate}</span>
                                </div>
                                <h2 className="mb-2 line-clamp-2 text-lg font-bold text-brand-primary">{event.title}</h2>
                                <p className="mb-4 line-clamp-2 text-xs leading-relaxed text-muted">{event.description}</p>
                                <div className="mb-5 space-y-1.5 border-t border-ui-border pt-4 text-xs text-muted">
                                    <div className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-gray-400" />{event.eventTime}</div>
                                    <div className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-gray-400" />{event.venue}</div>
                                    <div className="flex items-center gap-2"><Users className="h-3.5 w-3.5 text-gray-400" />Organized by {event.organizerName}</div>
                                </div>
                            </div>
                            <button
                                onClick={() => cancelRsvp(event.id)}
                                disabled={cancellingId === event.id}
                                className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-red-50 py-2.5 text-xs font-bold text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <XCircle className="h-4 w-4" />
                                {cancellingId === event.id ? 'Cancelling...' : 'Cancel RSVP'}
                            </button>
                        </article>
                    ))}
                </div>
            )}
        </main>
    );
}

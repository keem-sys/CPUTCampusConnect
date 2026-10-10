import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    Calendar,
    Clock,
    MapPin,
    Users,
    ArrowLeft,
    Mail,
    CheckCircle2,
    Tag,
    Building2,
    Share2
} from 'lucide-react';
import { isAxiosError } from 'axios';
import axiosClient from '../services/axiosClient';
import type { UserProfile } from '../types/apiResponses';
import { useOutletContext } from 'react-router-dom';
import toast from 'react-hot-toast';

interface CampusEventDetail {
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
    isRegistered: boolean;
    organizerName: string;
    organizerEmail: string;
}

interface LayoutContextType {
    user: UserProfile | null;
}

const CAMPUS_LABELS: Record<string, string> = {
    CAPE_TOWN: 'District Six Campus',
    BELLVILLE: 'Bellville Campus',
    GRANGER_BAY: 'Granger Bay Campus',
    MOWBRAY: 'Mowbray Campus',
    WELLINGTON: 'Wellington Campus',
    ATHLONE: 'Athlone Campus',
    ONLINE: 'Online / Virtual',
};

export default function EventDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useOutletContext<LayoutContextType>();

    const [event, setEvent] = useState<CampusEventDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const response = await axiosClient.get<CampusEventDetail>(`/api/events/${id}`);
                setEvent(response.data);
            } catch (err: unknown) {
                if (isAxiosError(err) && err.response?.status === 404) {
                    toast.error('Event not found.');
                    navigate('/dashboard', { replace: true });
                    return;
                }
                toast.error('Unable to load event details.');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchEvent();
    }, [id, navigate]);

    const handleRsvpToggle = async () => {
        if (!event) return;

        if (user?.role !== 'STUDENT') {
            toast.error('Only students can RSVP to events.');
            return;
        }

        if (!event.isRegistered && event.registeredCount >= event.capacity) {
            toast.error('This event is fully booked.');
            return;
        }

        setActionLoading(true);

        try {
            const response = event.isRegistered
                ? await axiosClient.delete<CampusEventDetail>(`/api/events/${event.id}/rsvp`)
                : await axiosClient.post<CampusEventDetail>(`/api/events/${event.id}/rsvp`);

            setEvent(response.data);
            toast.success(
                event.isRegistered
                    ? `Cancelled registration for: ${event.title}`
                    : `Successfully registered for: ${event.title}!`
            );
        } catch (err: unknown) {
            let message = 'Unable to update your RSVP.';
            if (isAxiosError<{ message?: string }>(err)) {
                message = err.response?.data?.message || message;
            }
            toast.error(message);
        } finally {
            setActionLoading(false);
        }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Event link copied to clipboard!');
    };

    if (loading) {
        return (
            <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-16 text-center text-sm font-semibold text-muted font-brand">
                Loading event details...
            </main>
        );
    }

    if (!event) return null;

    const isFull = event.registeredCount >= event.capacity;
    const capacityPercent = Math.min(100, Math.round((event.registeredCount / event.capacity) * 100));

    return (
        <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 lg:px-8 font-brand text-primary">

            {/* Top Breadcrumb & Share Navigation */}
            <div className="flex items-center justify-between mb-6">
                <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-muted hover:text-brand-primary transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Events
                </Link>

                <button
                    onClick={handleShare}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-ui-border bg-card px-3 py-1.5 text-xs font-bold text-brand-primary shadow-subtle hover:bg-gray-50 transition-colors cursor-pointer"
                >
                    <Share2 className="h-3.5 w-3.5" />
                    Share Event
                </button>
            </div>

            {/* Main Grid: Details (Left) + Action Card (Right) */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

                {/* Left 2 Columns: Full Event Content */}
                <div className="lg:col-span-2 space-y-6">

                    <div className="rounded-2xl border border-ui-border bg-card p-6 sm:p-8 shadow-subtle">

                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-brand-primary uppercase tracking-wide">
                <Tag className="h-3 w-3" />
                  {event.category}
              </span>

                            {event.campus && (
                                <span className="inline-flex items-center gap-1 rounded-md bg-orange-50 px-2.5 py-1 text-[11px] font-bold text-brand-accent uppercase tracking-wide border border-orange-100">
                  <Building2 className="h-3 w-3" />
                                    {CAMPUS_LABELS[event.campus] || event.campus}
                </span>
                            )}

                            {event.isRegistered && (
                                <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="h-3 w-3" />
                  You are registered
                </span>
                            )}
                        </div>

                        {/* Event Title */}
                        <h1 className="text-2xl font-black text-brand-primary sm:text-3xl leading-tight mb-4">
                            {event.title}
                        </h1>

                        {/* Comprehensive Description (No truncation) */}
                        <div className="border-t border-ui-border pt-6 mt-6">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-muted mb-3">
                                About this Event
                            </h2>
                            <p className="text-sm text-primary leading-relaxed whitespace-pre-line">
                                {event.description}
                            </p>
                        </div>
                    </div>

                    {/* Organizer Card */}
                    <div className="rounded-2xl border border-ui-border bg-card p-6 shadow-subtle flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                                Event Organizer
                            </p>
                            <h3 className="text-base font-bold text-brand-primary mt-0.5">
                                {event.organizerName}
                            </h3>
                            <p className="text-xs text-muted mt-0.5 flex items-center gap-1.5">
                                <Mail className="h-3.5 w-3.5 text-gray-400" />
                                {event.organizerEmail}
                            </p>
                        </div>

                        <a
                            href={`mailto:${event.organizerEmail}?subject=Inquiry: ${encodeURIComponent(event.title)}`}
                            className="rounded-lg border border-ui-border bg-[#F4F5F7] px-4 py-2 text-xs font-bold text-brand-primary hover:bg-gray-200 transition-colors"
                        >
                            Contact Organizer
                        </a>
                    </div>

                </div>

                {/* Right 1 Column: Event Logistics & RSVP Card */}
                <div className="space-y-6">
                    <div className="sticky top-24 rounded-2xl border border-ui-border bg-card p-6 shadow-subtle space-y-6">

                        <h3 className="text-base font-bold text-brand-primary border-b border-ui-border pb-3">
                            Event Details
                        </h3>

                        {/* Logistics list */}
                        <div className="space-y-4 text-xs">
                            <div className="flex items-start gap-3">
                                <Calendar className="h-4 w-4 text-brand-accent shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold text-brand-primary">Date</p>
                                    <p className="text-muted mt-0.5">{event.eventDate}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Clock className="h-4 w-4 text-brand-accent shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold text-brand-primary">Time</p>
                                    <p className="text-muted mt-0.5">{event.eventTime}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <MapPin className="h-4 w-4 text-brand-accent shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold text-brand-primary">Venue & Location</p>
                                    <p className="text-muted mt-0.5">{event.venue}</p>
                                    {event.campus && (
                                        <p className="text-[11px] text-brand-primary font-semibold mt-0.5">
                                            {CAMPUS_LABELS[event.campus] || event.campus}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <Users className="h-4 w-4 text-brand-accent shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-1">
                                        <p className="font-bold text-brand-primary">Attendance</p>
                                        <span className={`font-bold ${isFull ? 'text-red-500' : 'text-muted'}`}>
                      {event.registeredCount} / {event.capacity}
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
                            </div>
                        </div>

                        {/* RSVP Action Button */}
                        <div className="pt-4 border-t border-ui-border">
                            {user?.role !== 'STUDENT' ? (
                                <div className="w-full rounded-lg bg-gray-100 py-3 text-center text-xs font-bold text-gray-400">
                                    Only students can RSVP
                                </div>
                            ) : (
                                <button
                                    onClick={handleRsvpToggle}
                                    disabled={actionLoading || (isFull && !event.isRegistered)}
                                    className={`w-full py-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed ${
                                        event.isRegistered
                                            ? 'border border-red-200 bg-red-50 text-red-600 hover:bg-red-100'
                                            : isFull
                                                ? 'bg-gray-100 text-gray-400'
                                                : 'bg-brand-primary text-white hover:opacity-90 shadow-md active:scale-[0.99]'
                                    }`}
                                >
                                    {event.isRegistered ? (
                                        'Cancel My Reservation'
                                    ) : isFull ? (
                                        'Event is Fully Booked'
                                    ) : (
                                        'Reserve Your Spot (RSVP)'
                                    )}
                                </button>
                            )}
                        </div>

                    </div>
                </div>

            </div>
        </main>
    );
}
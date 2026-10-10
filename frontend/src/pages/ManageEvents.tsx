import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    ArrowLeft,
    Search,
    Download,
    Trash2,
    Calendar,
    Clock,
    MapPin,
    UserCheck
} from 'lucide-react';
import axiosClient from '../services/axiosClient';
import toast from 'react-hot-toast';

interface Attendee {
    userId: string;
    fullName: string;
    email: string;
    registeredAt: string;
}

interface EventSummary {
    id: string;
    title: string;
    venue: string;
    eventDate: string;
    eventTime: string;
    capacity: number;
    registeredCount: number;
}

export default function ManageEvents() {
    const { id } = useParams<{ id: string }>();

    const [event, setEvent] = useState<EventSummary | null>(null);
    const [attendees, setAttendees] = useState<Attendee[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [removingId, setRemovingId] = useState<string | null>(null);

    useEffect(() => {
        const fetchEventAndAttendees = async () => {
            try {
                const [eventRes, attendeesRes] = await Promise.all([
                    axiosClient.get<EventSummary>(`/api/events/${id}`),
                    axiosClient.get<Attendee[]>(`/api/events/${id}/attendees`),
                ]);
                setEvent(eventRes.data);
                setAttendees(attendeesRes.data);
            } catch (err: unknown) {
                toast.error('Unable to load attendee roster.', { id: 'roster-error' });
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchEventAndAttendees();
    }, [id]);

    // Remove a student reservation
    const handleRemoveAttendee = async (userId: string, studentName: string) => {
        const confirmed = window.confirm(`Remove ${studentName} from this event? This will open up a seat.`);
        if (!confirmed) return;

        setRemovingId(userId);
        try {
            await axiosClient.delete(`/api/events/${id}/attendees/${userId}`);
            setAttendees((prev) => prev.filter((a) => a.userId !== userId));
            setEvent((prev) => prev ? { ...prev, registeredCount: Math.max(0, prev.registeredCount - 1) } : null);
            toast.success(`${studentName} removed from attendee list.`);
        } catch (err: unknown) { // <-- Fixed here
            toast.error('Failed to remove attendee.');
        } finally {
            setRemovingId(null);
        }
    };

    // Export attendee roster to CSV for printing or audit
    const handleExportCSV = () => {
        if (!attendees.length) {
            toast.error('No attendees to export.');
            return;
        }

        const headers = 'Full Name,Student Email,Registration Date\n';
        const rows = attendees
            .map((a) => `"${a.fullName}","${a.email}","${new Date(a.registeredAt).toLocaleString()}"`)
            .join('\n');

        const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `${event?.title.replace(/[^a-zA-Z0-9]/g, '_')}_Attendees.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Roster downloaded as CSV!');
    };

    const filteredAttendees = attendees.filter((a) =>
        a.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-16 text-center text-sm font-semibold text-muted font-brand">
                Loading attendee roster...
            </main>
        );
    }

    const percent = event ? Math.min(100, Math.round((event.registeredCount / event.capacity) * 100)) : 0;

    return (
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 lg:px-8 font-brand text-primary">

            {/* Navigation & Header */}
            <Link
                to="/organizer/events"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-muted hover:text-brand-primary mb-6 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to My Events
            </Link>

            {/* Event Header Summary Card */}
            {event && (
                <div className="rounded-2xl border border-ui-border bg-card p-6 shadow-subtle mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                            Attendee Management
                        </span>
                        <h1 className="text-2xl font-black text-brand-primary mt-1">
                            {event.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted mt-3">
                            <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-brand-accent" />{event.eventDate}</span>
                            <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-brand-accent" />{event.eventTime}</span>
                            <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-brand-accent" />{event.venue}</span>
                        </div>
                    </div>

                    {/* Quick Capacity Meter & CSV Download */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="w-48 bg-[#F4F5F7] p-3 rounded-xl border border-ui-border">
                            <div className="flex justify-between text-xs font-bold mb-1.5">
                                <span>Booked Spots</span>
                                <span>{event.registeredCount} / {event.capacity}</span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all ${percent > 90 ? 'bg-red-500' : 'bg-brand-primary'}`}
                                    style={{ width: `${percent}%` }}
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleExportCSV}
                            className="inline-flex items-center gap-2 rounded-lg border border-ui-border bg-card px-4 py-2.5 text-xs font-bold text-brand-primary shadow-subtle hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            <Download className="h-4 w-4 text-brand-accent" />
                            Export CSV
                        </button>
                    </div>
                </div>
            )}

            {/* Roster Controls: Search & Counter */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
                <div className="relative w-full sm:w-80">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search students by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full rounded-lg border border-ui-border bg-card py-2 pl-10 pr-3 text-xs text-primary placeholder:text-muted focus:ring-1 focus:ring-brand-primary"
                    />
                </div>

                <p className="text-xs font-semibold text-muted">
                    Showing <strong className="text-brand-primary">{filteredAttendees.length}</strong> of {attendees.length} registered students
                </p>
            </div>

            {/* Roster Table */}
            {filteredAttendees.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-ui-border bg-card py-16 text-center">
                    <UserCheck className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                    <p className="text-sm font-bold text-brand-primary">No attendees found</p>
                    <p className="text-xs text-muted mt-1">
                        {searchQuery ? 'No students match your search criteria.' : 'No students have RSVP\'d to this event yet.'}
                    </p>
                </div>
            ) : (
                <div className="rounded-2xl border border-ui-border bg-card shadow-subtle overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                            <tr className="border-b border-ui-border bg-[#F8F9FA] text-[10px] font-bold uppercase tracking-wider text-muted">
                                <th className="py-3.5 px-6">Student Name</th>
                                <th className="py-3.5 px-6">Email Address</th>
                                <th className="py-3.5 px-6">RSVP Timestamp</th>
                                <th className="py-3.5 px-6 text-right">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-ui-border">
                            {filteredAttendees.map((attendee) => (
                                <tr key={attendee.userId} className="hover:bg-gray-50/80 transition-colors">

                                    {/* Name */}
                                    <td className="py-3.5 px-6 font-bold text-brand-primary">
                                        {attendee.fullName}
                                    </td>

                                    {/* Email */}
                                    <td className="py-3.5 px-6 text-muted">
                                        {attendee.email}
                                    </td>

                                    {/* Timestamp */}
                                    <td className="py-3.5 px-6 text-muted">
                                        {new Date(attendee.registeredAt).toLocaleDateString('en-ZA', {
                                            day: 'numeric',
                                            month: 'short',
                                            year: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                        })}
                                    </td>

                                    {/* Action */}
                                    <td className="py-3.5 px-6 text-right">
                                        <button
                                            onClick={() => handleRemoveAttendee(attendee.userId, attendee.fullName)}
                                            disabled={removingId === attendee.userId}
                                            title="Remove Student from Event"
                                            className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                            Remove
                                        </button>
                                    </td>

                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

        </main>
    );
}
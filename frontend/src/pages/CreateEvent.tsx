import { useState } from 'react';
import {
    Calendar,
    Clock,
    MapPin,
    Users,
    Tag,
    Check,
    ArrowLeft,
    Building2,
    Image as ImageIcon
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { isAxiosError } from 'axios';
import axiosClient from '../services/axiosClient';
import type { BackendErrorResponse } from '../types/apiResponses';
import toast from 'react-hot-toast';

export default function CreateEvent() {
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('ACADEMIC');
    const [campus, setCampus] = useState('CAPE_TOWN');
    const [eventDate, setEventDate] = useState('');
    const [eventTime, setEventTime] = useState('');
    const [venue, setVenue] = useState('');
    const [capacity, setCapacity] = useState<number | ''>(50);
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(false);

    const today = new Date().toISOString().split('T')[0];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // ✅ 1. Include imageUrl in the payload (trim or pass null if blank)
            const payload = {
                title,
                description,
                category,
                campus,
                eventDate,
                eventTime,
                venue,
                capacity: Number(capacity),
                imageUrl: imageUrl.trim() || null
            };

            await axiosClient.post('/api/events', payload);

            toast.success('Event published successfully!');
            navigate('/dashboard'); // Take them back to see their newly created event
        } catch (err: unknown) {
            let message = 'Failed to create event. Please verify inputs.';
            if (isAxiosError<BackendErrorResponse>(err)) {
                message = err.response?.data?.message || message;
            }
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-6 lg:px-8 font-brand">

            {/* Back button link */}
            <Link
                to="/dashboard"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-muted hover:text-brand-primary mb-6 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Events
            </Link>

            {/* Main Form Card */}
            <div className="rounded-2xl border border-ui-border bg-card p-6 sm:p-10 shadow-subtle">

                <div className="border-b border-ui-border pb-5 mb-6">
                    <h1 className="text-2xl font-black text-brand-primary sm:text-3xl">
                        Create Campus Event
                    </h1>
                    <p className="mt-1 text-sm text-muted">
                        Publish a new activity, workshop, or gathering for CPUT students.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Title */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-muted">
                            Event Title
                        </label>
                        <input
                            type="text"
                            required
                            maxLength={150}
                            placeholder="e.g., Annual Tech & Innovation Expo"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full rounded-lg border border-ui-border bg-[#F4F5F7] py-2.5 px-3.5 text-sm text-brand-primary placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
                        />
                    </div>

                    {/* Category & Campus Row */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold uppercase tracking-wider text-muted">
                                Category
                            </label>
                            <div className="relative">
                                <Tag className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full rounded-lg border border-ui-border bg-[#F4F5F7] py-2.5 pl-10 pr-3 text-sm text-brand-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all cursor-pointer"
                                >
                                    <option value="ACADEMIC">Academic</option>
                                    <option value="CAREER">Career</option>
                                    <option value="SPORTS">Sports</option>
                                    <option value="WORKSHOP">Workshop</option>
                                    <option value="SOCIAL">Social</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold uppercase tracking-wider text-muted">
                                CPUT Campus
                            </label>
                            <div className="relative">
                                <Building2 className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <select
                                    value={campus}
                                    onChange={(e) => setCampus(e.target.value)}
                                    className="w-full rounded-lg border border-ui-border bg-[#F4F5F7] py-2.5 pl-10 pr-3 text-sm text-brand-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all cursor-pointer"
                                >
                                    <option value="CAPE_TOWN">District Six Campus</option>
                                    <option value="BELLVILLE">Bellville Campus</option>
                                    <option value="GRANGER_BAY">Granger Bay Campus</option>
                                    <option value="MOWBRAY">Mowbray Campus</option>
                                    <option value="WELLINGTON">Wellington Campus</option>
                                    <option value="ATHLONE">Athlone Campus</option>
                                    <option value="ONLINE">Online / Virtual</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Date, Time & Capacity Row */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold uppercase tracking-wider text-muted">
                                Event Date
                            </label>
                            <div className="relative">
                                <Calendar className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="date"
                                    required
                                    min={today}
                                    value={eventDate}
                                    onChange={(e) => setEventDate(e.target.value)}
                                    className="w-full rounded-lg border border-ui-border bg-[#F4F5F7] py-2.5 pl-10 pr-3 text-sm text-brand-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold uppercase tracking-wider text-muted">
                                Time Frame
                            </label>
                            <div className="relative">
                                <Clock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g., 10:00 - 13:00"
                                    value={eventTime}
                                    onChange={(e) => setEventTime(e.target.value)}
                                    className="w-full rounded-lg border border-ui-border bg-[#F4F5F7] py-2.5 pl-10 pr-3 text-sm text-brand-primary placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold uppercase tracking-wider text-muted">
                                Max Capacity
                            </label>
                            <div className="relative">
                                <Users className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="number"
                                    required
                                    min={1}
                                    placeholder="50"
                                    value={capacity}
                                    onChange={(e) => setCapacity(Number(e.target.value))}
                                    className="w-full rounded-lg border border-ui-border bg-[#F4F5F7] py-2.5 pl-10 pr-3 text-sm text-brand-primary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Venue / Location */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-muted">
                            Venue / Room Details
                        </label>
                        <div className="relative">
                            <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                required
                                placeholder="e.g., Multi-Purpose Hall / Lab 3.12"
                                value={venue}
                                onChange={(e) => setVenue(e.target.value)}
                                className="w-full rounded-lg border border-ui-border bg-[#F4F5F7] py-2.5 pl-10 pr-3 text-sm text-brand-primary placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
                            />
                        </div>
                    </div>

                    {/* Event Banner Image URL (Moved properly before Description) */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <label className="block text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
                                <ImageIcon className="h-3.5 w-3.5 text-gray-400" />
                                Event Banner Image URL (Optional)
                            </label>
                            <span className="text-[10px] text-muted">Unsplash or web link</span>
                        </div>
                        <input
                            type="url"
                            placeholder="https://images.unsplash.com/photo-..."
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                            className="w-full rounded-lg border border-ui-border bg-[#F4F5F7] py-2.5 px-3.5 text-sm text-brand-primary placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all"
                        />

                        {/* Live Image Preview Thumbnail */}
                        {imageUrl && (
                            <div className="mt-2 h-40 w-full rounded-xl overflow-hidden border border-ui-border bg-gray-100">
                                <img
                                    src={imageUrl}
                                    alt="Banner Preview"
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                        (e.currentTarget as HTMLElement).style.display = 'none';
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold uppercase tracking-wider text-muted">
                            Event Description & Agenda
                        </label>
                        <textarea
                            required
                            rows={4}
                            placeholder="Provide a comprehensive event overview, guest speakers, or requirements for attendees..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full rounded-lg border border-ui-border bg-[#F4F5F7] py-2.5 px-3.5 text-sm text-brand-primary placeholder:text-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-primary transition-all resize-none"
                        />
                    </div>

                    {/* Form Submit Actions (Always at the very bottom!) */}
                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-ui-border">
                        <Link
                            to="/dashboard"
                            className="rounded-lg px-4 py-2.5 text-xs font-semibold text-muted hover:bg-gray-100 transition-colors"
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-6 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                        >
                            <Check className="h-4 w-4" />
                            {loading ? 'Publishing Event...' : 'Publish Event'}
                        </button>
                    </div>

                </form>
            </div>
        </main>
    );
}
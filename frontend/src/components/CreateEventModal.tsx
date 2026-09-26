import React, { useState } from 'react';
import {
    X,
    Calendar,
    Clock,
    MapPin,
    Users,
    Tag,
    Check
} from 'lucide-react';
import { isAxiosError } from 'axios';
import axiosClient from '../services/axiosClient';
import type {BackendErrorResponse} from '../types/apiResponses';
import toast from 'react-hot-toast';

interface CreateEventModalProps {
    isOpen: boolean;
    onClose: () => void;
    onEventCreated: (newEvent: any) => void;
}

export default function CreateEventModal({ isOpen, onClose, onEventCreated }: CreateEventModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('ACADEMIC');
    const [eventDate, setEventDate] = useState('');
    const [eventTime, setEventTime] = useState('');
    const [venue, setVenue] = useState('');
    const [capacity, setCapacity] = useState<number | ''>(50);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    // Prevent picking past dates
    const today = new Date().toISOString().split('T')[0];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                title,
                description,
                category,
                eventDate,
                eventTime,
                venue,
                capacity: Number(capacity)
            };

            const response = await axiosClient.post('/api/events', payload);

            toast.success('Event created and published successfully!');
            onEventCreated(response.data);
            onClose();

            // Reset form fields
            setTitle('');
            setDescription('');
            setCategory('ACADEMIC');
            setEventDate('');
            setEventTime('');
            setVenue('');
            setCapacity(50);
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto font-brand">
            <div className="relative w-full max-w-lg rounded-2xl bg-card p-6 sm:p-8 shadow-2xl border border-ui-border my-8">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-ui-border pb-4">
                    <div>
                        <h2 className="text-xl font-bold text-brand-primary">Create Campus Event</h2>
                        <p className="text-xs text-muted">Publish a new activity for CPUT students.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="mt-5 space-y-4">

                    {/* Title */}
                    <div className="space-y-1">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-muted">
                            Event Title
                        </label>
                        <input
                            type="text"
                            required
                            maxLength={150}
                            placeholder="e.g., Annual Tech & Innovation Expo"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full rounded-lg border-0 bg-[#F4F5F7] py-2 px-3 text-sm text-brand-primary placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-brand-primary transition-all"
                        />
                    </div>

                    {/* Category & Capacity Row */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-muted">
                                Category
                            </label>
                            <div className="relative">
                                <Tag className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full rounded-lg border-0 bg-[#F4F5F7] py-2 pl-9 pr-3 text-sm text-brand-primary focus:bg-white focus:ring-2 focus:ring-brand-primary transition-all cursor-pointer"
                                >
                                    <option value="ACADEMIC">Academic</option>
                                    <option value="CAREER">Career</option>
                                    <option value="SPORTS">Sports</option>
                                    <option value="WORKSHOP">Workshop</option>
                                    <option value="SOCIAL">Social</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-muted">
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
                                    className="w-full rounded-lg border-0 bg-[#F4F5F7] py-2 pl-9 pr-3 text-sm text-brand-primary focus:bg-white focus:ring-2 focus:ring-brand-primary transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Date & Time Row */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-muted">
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
                                    className="w-full rounded-lg border-0 bg-[#F4F5F7] py-2 pl-9 pr-3 text-sm text-brand-primary focus:bg-white focus:ring-2 focus:ring-brand-primary transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-muted">
                                Time Frame
                            </label>
                            <div className="relative">
                                <Clock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g., 10:00 AM - 13:00 PM"
                                    value={eventTime}
                                    onChange={(e) => setEventTime(e.target.value)}
                                    className="w-full rounded-lg border-0 bg-[#F4F5F7] py-2 pl-9 pr-3 text-sm text-brand-primary placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-brand-primary transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Venue */}
                    <div className="space-y-1">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-muted">
                            Venue / Location
                        </label>
                        <div className="relative">
                            <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                required
                                placeholder="e.g., Cape Town Campus - Lab 3.12"
                                value={venue}
                                onChange={(e) => setVenue(e.target.value)}
                                className="w-full rounded-lg border-0 bg-[#F4F5F7] py-2 pl-9 pr-3 text-sm text-brand-primary placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-brand-primary transition-all"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-muted">
                            Description
                        </label>
                        <textarea
                            required
                            rows={3}
                            placeholder="Provide event overview, agenda, or guest speaker details..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full rounded-lg border-0 bg-[#F4F5F7] py-2 px-3 text-sm text-brand-primary placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-brand-primary transition-all resize-none"
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex items-center justify-end gap-3 pt-4 border-t border-ui-border">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg px-4 py-2 text-xs font-semibold text-muted hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center gap-2 rounded-lg bg-brand-primary px-5 py-2 text-xs font-bold text-white shadow-md hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                        >
                            <Check className="h-4 w-4" />
                            {loading ? 'Publishing...' : 'Publish Event'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
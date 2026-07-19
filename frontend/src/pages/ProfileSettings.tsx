import React, { useState, useEffect } from 'react';
import {
    Landmark,
    User,
    Mail,
    Lock,
    Key,
    CheckCircle2,
    ArrowLeft
} from 'lucide-react';
import { isAxiosError } from 'axios';
import axiosClient from '../services/axiosClient';
import type {BackendErrorResponse} from '../types/apiResponses';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';
import {useNavigate} from "react-router-dom";

interface UserProfile {
    userId: string;
    fullName: string;
    email: string;
    role: 'STUDENT' | 'ORGANIZER' | 'ADMIN';
}

export default function ProfileSettings() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    const [pageLoading, setPageLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    // Fetch the current user details to pre-populate the form
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await axiosClient.get<UserProfile>('/api/users/me');
                setFullName(response.data.fullName);
                setEmail(response.data.email);
            } catch (err: unknown) {
                toast.error('Failed to load profile details.');
            } finally {
                setPageLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');

        // Frontend validation: If they filled New Password, they must provide Current Password
        if (newPassword && !currentPassword) {
            setErrorMessage('Current password is required to change your password.');
            toast.error('Please enter your current password.');
            return;
        }

        setLoading(true);

        try {
            const response = await axiosClient.put<UserProfile>('/api/users/profile', {
                fullName,
                currentPassword: currentPassword || null,
                newPassword: newPassword || null
            });

            if (newPassword) {
                localStorage.removeItem('token');
                sessionStorage.removeItem('token');

                toast.success('Password changed successfully! Please log in with your new credentials.', {
                    duration: 6000
                });

                navigate('/login', { replace: true });
            }

            else {
                setFullName(response.data.fullName);
                setCurrentPassword('');
                setNewPassword('');
                toast.success('Profile details updated successfully!');
            }
        } catch (err: unknown) {
            let message = 'An unexpected network error occurred.';

            if (isAxiosError<BackendErrorResponse>(err)) {
                message = err.response?.data?.message || 'Failed to save changes. Please try again.';
            } else if (err instanceof Error) {
                message = err.message;
            }

            setErrorMessage(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        const confirmDelete = window.confirm(
            "WARNING: Are you sure you want to permanently delete your account? This action is irreversible and all your data will be lost."
        );

        if (!confirmDelete) return;

        setLoading(true);

        try {
            await axiosClient.delete('/api/users/profile');

            localStorage.removeItem('token');
            sessionStorage.removeItem('token');

            toast.success('Your account has been deleted successfully.');

            navigate('/register', { replace: true });
        } catch (err: unknown) {
            let message = 'Failed to delete account. Please try again.';

            if (isAxiosError<BackendErrorResponse>(err)) {
                message = err.response?.data?.message || message;
            }

            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-app">
                <div className="text-sm font-semibold text-brand-primary animate-pulse">
                    Loading profile...
                </div>
            </div>
        );
    }

    return (
        <div className="relative flex min-h-screen flex-col bg-app font-brand">

            {/* Center content container */}
            <div className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">

                {/* Top Header Section */}
                <div className="mb-6 flex flex-col items-center text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary shadow-sm">
                        <Landmark className="h-6 w-6 text-white" />
                    </div>
                    <h1 className="text-md font-bold tracking-tight text-brand-primary uppercase">
                        Profile Settings
                    </h1>
                </div>

                {/* Form Card */}
                <div className="w-full max-w-md bg-card px-8 py-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl sm:px-10 border border-ui-border">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-brand-primary">
                            Profile & Security
                        </h2>
                        <p className="mt-1 text-xs text-muted">
                            Manage your account details and password.
                        </p>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>

                        {/* Error Banner */}
                        {errorMessage && (
                            <div className="rounded-brand bg-red-50 p-3 text-sm text-red-500 border border-red-200 text-center">
                                {errorMessage}
                            </div>
                        )}

                        {/* Full Name Input */}
                        <div className="space-y-1.5">
                            <label htmlFor="fullName" className="block text-[10px] font-bold uppercase tracking-wider text-muted">
                                Full Name
                            </label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <User className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    id="fullName"
                                    type="text"
                                    required
                                    className="block w-full rounded-lg border-0 bg-[#F4F5F7] py-2.5 pl-10 pr-3 text-brand-primary placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-brand-primary transition-colors sm:text-sm"
                                    placeholder="Enter your legal name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Email Input (Disabled/ReadOnly as it is the primary unique identifier) */}
                        <div className="space-y-1.5">
                            <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-wider text-muted">
                                Email
                            </label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <Mail className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    readOnly
                                    disabled
                                    className="block w-full rounded-lg border-0 bg-[#F4F5F7] py-2.5 pl-10 pr-3 text-brand-primary/50 opacity-80 cursor-not-allowed sm:text-sm"
                                    placeholder="email@mycput.ac.za"
                                    value={email}
                                />
                            </div>
                        </div>

                        {/* Current Password Input */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label htmlFor="currentPassword" className="block text-[10px] font-bold uppercase tracking-wider text-muted">
                                    Current Password
                                </label>
                                <span className="text-[9px] font-medium text-muted">
                  Required only if changing password
                </span>
                            </div>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <Lock className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    id="currentPassword"
                                    type="password"
                                    className="block w-full rounded-lg border-0 bg-[#F4F5F7] py-2.5 pl-10 pr-3 text-brand-primary placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-brand-primary transition-colors sm:text-sm"
                                    placeholder="••••••••"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* New Password Input */}
                        <div className="space-y-1.5">
                            <label htmlFor="newPassword" className="block text-[10px] font-bold uppercase tracking-wider text-muted">
                                New Password
                            </label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <Key className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    id="newPassword"
                                    type="password"
                                    minLength={8}
                                    className="block w-full rounded-lg border-0 bg-[#F4F5F7] py-2.5 pl-10 pr-3 text-brand-primary placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-brand-primary transition-colors sm:text-sm"
                                    placeholder="Enter new password (min. 8 characters)"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Save Changes Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-2 group flex w-full items-center justify-center gap-2 rounded-lg bg-brand-primary py-3 text-sm font-semibold text-white shadow-md hover:opacity-90 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary transition-all disabled:opacity-50 cursor-pointer"
                        >
                            <CheckCircle2 className="h-4 w-4" />
                            {loading ? 'Saving Changes...' : 'Save Changes'}
                        </button>
                    </form>

                    {/* DANGER ZONE (Delete Account) */}
                    <div className="mt-8 pt-6 border-t border-red-100">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-red-500 mb-1">
                            Danger Zone
                        </h3>
                        <p className="text-[10px] text-muted mb-3">
                            Permanently delete your account and all of your data.
                        </p>
                        <button
                            type="button"
                            disabled={loading}
                            onClick={handleDeleteAccount}
                            className="w-full rounded-lg border border-red-200 bg-red-50 py-2 text-xs font-bold text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50 cursor-pointer"
                        >
                            Delete Account
                        </button>
                    </div>

                    {/* Back to Dashboard Link */}
                    <div className="mt-6 text-center">
                        <a
                            href="/dashboard"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:underline"
                        >
                            <ArrowLeft className="h-3 w-3" />
                            Back to Dashboard
                        </a>
                    </div>
                </div>
            </div>

            {/* Shared Footer component */}
            <Footer />
        </div>
    );
}
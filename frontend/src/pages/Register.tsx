import React, { useState } from 'react';
import {
    Landmark,
    User,
    Mail,
    Lock,
    ArrowRight,
    Calendar,
    UserCheck,
    LockKeyhole
} from 'lucide-react';
import { isAxiosError } from 'axios';
import api from '../services/axiosClient';
import type { BackendErrorResponse } from '../types/apiResponses';
import cputCampusImg from '../assets/district-6-campus.jpg';
import Footer from "../components/Footer.tsx";
import toast from "react-hot-toast";
import {useNavigate, useLocation} from "react-router-dom";

type Role = 'STUDENT' | 'ORGANIZER' | 'ADMIN';

export default function Register() {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<Role>('STUDENT');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');

        if (password !== confirmPassword) {
            toast.error('Passwords do not match.');
            return;
        }

        setLoading(true);

        try {
            const response = await api.post('/api/auth/register', {
                fullName,
                email,
                password,
                role
            });

            const { token } = response.data;
            localStorage.setItem('token', token);
            toast.success('Registration successful! Redirecting...');
            const from = (location.state as any)?.from?.pathname || '/dashboard';
            navigate(from, { replace: true });

        } catch (err: unknown) {
            let message = 'An unexpected network error occurred.';

            if (isAxiosError<BackendErrorResponse>(err)) {
                message = err.response?.data?.message || 'Registration failed. Please try again.';
            } else if (err instanceof Error) {
                message = err.message;
            }

            setErrorMessage(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen flex-col bg-app font-brand overflow-x-hidden">

            {/* Top Header Section */}
            <div className="mt-12 mb-8 flex flex-col items-center text-center z-10">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary shadow-sm">
                    <Landmark className="h-6 w-6 text-white" />
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight text-brand-primary">
                    Campus Connect
                </h1>
                <p className="mt-1 text-sm text-muted">
                    Cape Peninsula University of Technology
                </p>
            </div>

            {/* Main Content Layout */}
            <main className="relative flex w-full flex-grow flex-col items-center px-4 pb-12">

                <div className="absolute right-[-5%] top-10 hidden w-96 rotate-6 transform rounded-2xl bg-white p-4 shadow-[0_20px_50px_rgb(0,0,0,0.1)] lg:block xl:right-[5%] opacity-90 pointer-events-none">
                    <div className="h-48 w-full rounded-xl bg-gray-200 overflow-hidden mb-4 border border-ui-border">
                        <img
                            src={cputCampusImg}
                            alt="CPUT Cape Town Campus"
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <div className="h-4 w-3/4 rounded bg-[#F4F5F7] mb-2"></div>
                    <div className="h-4 w-1/2 rounded bg-[#F4F5F7]"></div>
                    <div className="mt-6 h-12 w-full rounded bg-[#F8F9FA] border border-dashed border-gray-300"></div>
                </div>

                {/* Form Card */}
                <div className="z-10 w-full max-w-xl bg-card px-8 py-10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl border-b-4 border-brand-accent sm:px-10">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-brand-primary">Create Account</h2>
                        <p className="mt-1 text-sm text-muted">Join the community to organize and attend events.</p>
                    </div>

                    <form className="space-y-6" onSubmit={handleSubmit}>

                        {/* Error Message Alert */}
                        {errorMessage && (
                            <div className="rounded-md bg-red-50 p-3 text-sm text-red-500 border border-red-200">
                                {errorMessage}
                            </div>
                        )}

                        {/* Full Name Input */}
                        <div className="space-y-2">
                            <label htmlFor="fullName" className="block text-xs font-bold uppercase tracking-wider text-muted">
                                Full Name
                            </label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="fullName"
                                    type="text"
                                    required
                                    className="block w-full rounded-lg border-0 bg-[#F4F5F7] py-3 pl-10 pr-3 text-brand-primary placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-brand-primary transition-colors sm:text-sm"
                                    placeholder="Enter your legal name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Email Input */}
                        <div className="space-y-2">
                            <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-muted">
                                Email
                            </label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    className="block w-full rounded-lg border-0 bg-[#F4F5F7] py-3 pl-10 pr-3 text-brand-primary placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-brand-primary transition-colors sm:text-sm"
                                    placeholder="email@mycput.ac.za"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* User Role Selector */}
                        <div className="space-y-2">
                            <label className="block text-xs font-bold uppercase tracking-wider text-muted">
                                User Role
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                {/* Student Toggle */}
                                <button
                                    type="button"
                                    onClick={() => setRole('STUDENT')}
                                    className={`flex flex-col items-center justify-center rounded-lg py-3 border-2 transition-all cursor-pointer ${
                                        role === 'STUDENT'
                                            ? 'border-brand-primary bg-blue-50 text-brand-primary'
                                            : 'border-transparent bg-[#F4F5F7] text-muted hover:bg-gray-200'
                                    }`}
                                >
                                    <UserCheck className="mb-1 h-5 w-5" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Student</span>
                                </button>

                                {/* Organizer Toggle */}
                                <button
                                    type="button"
                                    onClick={() => setRole('ORGANIZER')}
                                    className={`flex flex-col items-center justify-center rounded-lg py-3 border-2 transition-all cursor-pointer ${
                                        role === 'ORGANIZER'
                                            ? 'border-brand-primary bg-blue-50 text-brand-primary'
                                            : 'border-transparent bg-[#F4F5F7] text-muted hover:bg-gray-200'
                                    }`}
                                >
                                    <Calendar className="mb-1 h-5 w-5" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Organizer</span>
                                </button>
                            </div>
                        </div>

                        {/* Password Row */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {/* Password */}
                            <div className="space-y-2">
                                <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-muted">
                                    Password
                                </label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <Lock className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="password"
                                        type="password"
                                        required
                                        minLength={8}
                                        className="block w-full rounded-lg border-0 bg-[#F4F5F7] py-3 pl-10 pr-3 text-brand-primary placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-brand-primary transition-colors sm:text-sm"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <label htmlFor="confirmPassword" className="block text-xs font-bold uppercase tracking-wider text-muted">
                                    Confirm Password
                                </label>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                        <LockKeyhole className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        required
                                        minLength={8}
                                        className="block w-full rounded-lg border-0 bg-[#F4F5F7] py-3 pl-10 pr-3 text-brand-primary placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-brand-primary transition-colors sm:text-sm"
                                        placeholder="••••••••"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="mt-4 group flex w-full items-center justify-center gap-2 rounded-lg bg-brand-primary py-3.5 text-sm font-semibold text-white shadow-md hover:opacity-90 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary transition-all disabled:opacity-50"
                        >
                            {loading ? 'Registering...' : 'Register'}
                            {!loading && <ArrowRight className="h-4 w-4" />}
                        </button>

                        <div className="pt-2 text-center text-sm text-muted">
                            Already have an account?{' '}
                            <a href="/login" className="font-bold text-brand-accent hover:underline">
                                Login here
                            </a>
                        </div>
                    </form>
                </div>

                {/* Registration Disclaimer */}
                <div className="mt-8 flex flex-col items-center space-y-3 z-10 text-center">
                    <p className="text-xs text-muted">
                        By registering, you agree to the Campus Connect Guidelines and Digital Privacy Policy.
                    </p>
                    <div className="flex space-x-4 text-xs font-semibold text-gray-500">
                        <a href="#" className="hover:text-brand-primary">Help Center</a>
                        <a href="#" className="hover:text-brand-primary">Campus IT Support</a>
                        <a href="#" className="hover:text-brand-primary">Contact Registrar</a>
                    </div>
                </div>

            </main>

            <Footer />
        </div>
    );
}
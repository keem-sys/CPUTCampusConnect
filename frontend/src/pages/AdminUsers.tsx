import { useEffect, useState } from 'react';
import {
    Users,
    Search,
    Trash2,
    ArrowLeft,
    Shield,
    Building2,
    GraduationCap
} from 'lucide-react';
import { Link, useOutletContext } from 'react-router-dom';
import { isAxiosError } from 'axios';
import axiosClient from '../services/axiosClient';
import type { UserProfile, Role, BackendErrorResponse } from '../types/apiResponses';
import toast from 'react-hot-toast';

interface LayoutContextType {
    user: UserProfile | null;
}

export default function AdminUsers() {
    const { user: currentAdmin } = useOutletContext<LayoutContextType>();

    const [users, setUsers] = useState<UserProfile[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axiosClient.get<UserProfile[]>('/api/admin/users');
                setUsers(response.data);
            } catch (err: unknown) {
                let message = 'Unable to load user accounts.';
                if (isAxiosError<BackendErrorResponse>(err)) {
                    message = err.response?.data?.message || message;
                }
                toast.error(message);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    // Handle Role Change (Promote / Demote)
    const handleRoleChange = async (userId: string, newRole: Role) => {
        setProcessingId(userId);
        try {
            const response = await axiosClient.put<UserProfile>(
                `/api/admin/users/${userId}/role?role=${newRole}`
            );

            setUsers((prev) => prev.map((u) => (u.userId === userId ? response.data : u)));
            toast.success(`Role updated to ${newRole}`);
        } catch (err: unknown) {
            let message = 'Failed to update user role.';
            if (isAxiosError<BackendErrorResponse>(err)) {
                message = err.response?.data?.message || message;
            }
            toast.error(message);
        } finally {
            setProcessingId(null);
        }
    };

    // Handle Account Deletion
    const handleDeleteUser = async (userId: string, userName: string) => {
        const confirmed = window.confirm(
            `Are you sure you want to permanently delete the account for "${userName}"? All their registrations and organized events will be removed.`
        );
        if (!confirmed) return;

        setProcessingId(userId);
        try {
            await axiosClient.delete(`/api/admin/users/${userId}`);
            setUsers((prev) => prev.filter((u) => u.userId !== userId));
            toast.success(`User "${userName}" deleted successfully.`);
        } catch (err: unknown) {
            let message = 'Failed to delete user.';
            if (isAxiosError<BackendErrorResponse>(err)) {
                message = err.response?.data?.message || message;
            }
            toast.error(message);
        } finally {
            setProcessingId(null);
        }
    };

    const filteredUsers = users.filter((u) => {
        const matchesSearch =
            u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesRole =
            selectedRoleFilter === 'ALL' || u.role === selectedRoleFilter;

        return matchesSearch && matchesRole;
    });

    if (loading) {
        return (
            <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-16 text-center text-sm font-semibold text-muted font-brand">
                Loading user accounts...
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
                        User & Role Management
                    </h1>
                    <p className="mt-1 text-sm text-muted">
                        Inspect all provisioned accounts, verify and grant organizer status, or delete accounts [2].
                    </p>
                </div>

                {/* Quick Role Tallies */}
                <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-bold">
          <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-brand-primary border border-blue-200">
            {users.filter(u => u.role === 'STUDENT').length} Students
          </span>
                    <span className="rounded-lg bg-amber-50 px-3 py-1.5 text-amber-800 border border-amber-200">
            {users.filter(u => u.role === 'ORGANIZER').length} Organizers
          </span>
                    <span className="rounded-lg bg-purple-50 px-3 py-1.5 text-purple-800 border border-purple-200">
            {users.filter(u => u.role === 'ADMIN').length} Admins
          </span>
                </div>
            </div>

            {/* Search Bar & Role Filter Pills */}
            <div className="mb-6 space-y-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by student/staff name or @mycput.ac.za email..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-lg border border-ui-border bg-card py-2.5 pl-10 pr-4 text-sm text-primary placeholder:text-muted focus:ring-1 focus:ring-brand-primary"
                        />
                    </div>

                    {/* Role Filter Tabs */}
                    <div className="flex gap-1.5 overflow-x-auto pb-1">
                        {['ALL', 'STUDENT', 'ORGANIZER', 'ADMIN'].map((roleKey) => (
                            <button
                                key={roleKey}
                                onClick={() => setSelectedRoleFilter(roleKey)}
                                className={`rounded-lg px-3.5 py-2 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                                    selectedRoleFilter === roleKey
                                        ? 'bg-brand-primary text-white shadow-sm'
                                        : 'bg-card text-muted border border-ui-border hover:bg-gray-100'
                                }`}
                            >
                                {roleKey === 'ALL' ? 'All Accounts' : `${roleKey}s`}
                            </button>
                        ))}
                    </div>
                </div>

                <p className="text-xs font-semibold text-muted">
                    Showing <strong className="text-brand-primary">{filteredUsers.length}</strong> of {users.length} accounts
                </p>
            </div>

            {/* Users Table */}
            {filteredUsers.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-ui-border bg-card py-16 text-center">
                    <Users className="mx-auto h-10 w-10 text-gray-300 mb-2" />
                    <p className="text-sm font-bold text-brand-primary">No users found</p>
                    <p className="text-xs text-muted mt-1">Try adjusting your search query or role filter.</p>
                </div>
            ) : (
                <div className="rounded-2xl border border-ui-border bg-card shadow-subtle overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                            <tr className="border-b border-ui-border bg-[#F8F9FA] text-[10px] font-bold uppercase tracking-wider text-muted">
                                <th className="py-4 px-6">User</th>
                                <th className="py-4 px-6">Email Address</th>
                                <th className="py-4 px-6">Current Role</th>
                                <th className="py-4 px-6">Change Role</th>
                                <th className="py-4 px-6 text-right">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-ui-border">
                            {filteredUsers.map((u) => {
                                const isCurrentAdmin = currentAdmin?.userId === u.userId;

                                return (
                                    <tr key={u.userId} className="hover:bg-gray-50/80 transition-colors">

                                        {/* Name & Avatar */}
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F4F5F7] text-brand-primary font-bold text-xs">
                                                    {u.fullName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-brand-primary">{u.fullName}</p>
                                                    {isCurrentAdmin && (
                                                        <span className="text-[10px] text-purple-700 font-semibold">(You)</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        {/* Email */}
                                        <td className="py-4 px-6 text-muted font-medium">
                                            {u.email}
                                        </td>

                                        {/* Role Badge */}
                                        <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                            u.role === 'ADMIN'
                                ? 'bg-purple-100 text-purple-800 border border-purple-200'
                                : u.role === 'ORGANIZER'
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                    : 'bg-blue-100 text-brand-primary border border-blue-200'
                        }`}>
                          {u.role === 'ADMIN' && <Shield className="h-3 w-3" />}
                            {u.role === 'ORGANIZER' && <Building2 className="h-3 w-3" />}
                            {u.role === 'STUDENT' && <GraduationCap className="h-3 w-3" />}
                            {u.role}
                        </span>
                                        </td>

                                        {/* Role Selector (Promote / Demote) */}
                                        <td className="py-4 px-6">
                                            {isCurrentAdmin ? (
                                                <span className="text-[11px] text-muted italic">Self-editing locked</span>
                                            ) : (
                                                <select
                                                    value={u.role}
                                                    disabled={processingId === u.userId}
                                                    onChange={(e) => handleRoleChange(u.userId, e.target.value as Role)}
                                                    className="rounded-lg border border-ui-border bg-[#F4F5F7] px-2.5 py-1 text-xs font-semibold text-brand-primary focus:bg-white focus:ring-1 focus:ring-brand-primary cursor-pointer disabled:opacity-50"
                                                >
                                                    <option value="STUDENT">Student</option>
                                                    <option value="ORGANIZER">Organizer</option>
                                                    <option value="ADMIN">Admin</option>
                                                </select>
                                            )}
                                        </td>

                                        {/* Delete / Ban Action */}
                                        <td className="py-4 px-6 text-right">
                                            {isCurrentAdmin ? (
                                                <span className="text-[11px] text-muted italic">—</span>
                                            ) : (
                                                <button
                                                    onClick={() => handleDeleteUser(u.userId, u.fullName)}
                                                    disabled={processingId === u.userId}
                                                    title="Delete Account"
                                                    className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 cursor-pointer"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                    Delete
                                                </button>
                                            )}
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
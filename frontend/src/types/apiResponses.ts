export interface BackendErrorResponse {
    status: number;
    error: string;
    message: string;
    timestamp: string;
}

export interface UserProfile {
    userId: string;
    fullName: string;
    email: string;
    role: 'STUDENT' | 'ORGANIZER' | 'ADMIN';
}

export interface CampusEvent{
    id: string;
    title: string;
    date: string;
    location: string;
    description: string;
    capacity: number;
    currentRSVPs: number;
    category: 'ACADEMIC' | 'SOCIAL' | 'SPORTS' | 'CULTURE' | 'WORKSHOP' | 'CAREER';
    status: 'APPROVED' | 'PENDING' | 'REJECTED';
    organizerId: string;
    organizerName: string;
    rsvpUserIds: string[];
    imageUrl?: string;
}
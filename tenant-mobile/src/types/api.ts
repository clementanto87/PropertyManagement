// API Response Types
export interface ApiResponse<T = any> {
    success: boolean;
    data: T;
    message?: string;
}

export interface ApiError {
    success: false;
    error: string;
    message: string;
    statusCode?: number;
}

// Auth Types
export interface LoginResponse {
    message: string;
}

export interface VerifyOTPResponse {
    token: string;
    tenant: TenantProfile;
}

// Tenant Types
export interface TenantProfile {
    id: number;
    userId: number;
    propertyId: number;
    unitId: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    emergencyContact?: string;
    emergencyPhone?: string;
    moveInDate: string;
    profilePhoto?: string;
    property?: Property;
    unit?: Unit;
    lease?: Lease;
}

export interface Property {
    id: number;
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    type: string;
}

export interface Unit {
    id: number;
    unitNumber: string;
    bedrooms: number;
    bathrooms: number;
    squareFeet?: number;
    floor?: number;
    property?: Property;
}

export interface Lease {
    id: number;
    startDate: string;
    endDate: string;
    monthlyRent: number;
    securityDeposit: number;
    status: 'ACTIVE' | 'EXPIRED' | 'TERMINATED';
    terms?: string;
}

// Dashboard Types
export interface DashboardData {
    tenant: TenantProfile;
    nextPayment?: Payment;
    recentPayments: Payment[];
    activeMaintenanceRequests: MaintenanceRequest[];
    upcomingEvents: Event[];
    announcements: Announcement[];
    stats: {
        onTimePayments: number;
        totalPayments: number;
        activeRequests: number;
        unreadMessages: number;
    };
    activities: Activity[];
}

export interface Activity {
    id: string;
    type: 'payment' | 'maintenance' | 'announcement' | 'document' | 'lease';
    title: string;
    description: string;
    timestamp: string; // ISO string from API
    icon: string;
    gradient: string[];
    actionLabel?: string;
    actionRoute?: string;
    status?: string;
}

// Payment Types
export interface Payment {
    id: number;
    amount: number;
    dueDate: string;
    paidDate?: string;
    status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
    type: 'RENT' | 'UTILITIES' | 'LATE_FEE' | 'OTHER';
    description?: string;
    receiptUrl?: string;
    paymentMethod?: string;
}

export interface PaymentMethod {
    id: number;
    type: 'CARD' | 'BANK_ACCOUNT';
    last4: string;
    brand?: string;
    isDefault: boolean;
    expiryMonth?: number;
    expiryYear?: number;
}

// Maintenance Request Types
export interface MaintenanceRequest {
    id: number;
    title: string;
    description: string;
    category: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
    location?: string;
    createdAt: string;
    updatedAt: string;
    scheduledDate?: string;
    completedDate?: string;
    assignedTo?: string;
    images?: string[];
    comments?: MaintenanceComment[];
}

export interface MaintenanceComment {
    id: number;
    text: string;
    createdAt: string;
    createdBy: string;
    isStaff: boolean;
}

export interface CreateMaintenanceRequest {
    title: string;
    description: string;
    category: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    location?: string;
    images?: string[];
}

// Document Types
export interface Document {
    id: number | string;
    name: string;
    type: string;
    category: string;
    url: string;
    size: number;
    uploadedAt: string;
    uploadedBy: string;
}

// Communication Types
export interface Announcement {
    id: number;
    title: string;
    content: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    createdAt: string;
    expiresAt?: string;
}

export interface Event {
    id: number;
    title: string;
    description: string;
    date: string;
    type: 'MAINTENANCE' | 'INSPECTION' | 'EVENT' | 'OTHER';
}

// Notification Types
export interface Notification {
    id: number;
    title: string;
    message: string;
    type: 'PAYMENT' | 'MAINTENANCE' | 'ANNOUNCEMENT' | 'DOCUMENT' | 'OTHER';
    isRead: boolean;
    createdAt: string;
    data?: any;
}

export interface NotificationPreferences {
    pushEnabled: boolean;
    emailEnabled: boolean;
    paymentReminders: boolean;
    maintenanceUpdates: boolean;
    announcements: boolean;
}

// Request Types
export interface UpdateProfileRequest {
    firstName?: string;
    lastName?: string;
    phone?: string;
    emergencyContact?: string;
    emergencyPhone?: string;
}

export interface UploadImageResponse {
    url: string;
    filename: string;
}

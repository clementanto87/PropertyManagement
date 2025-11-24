// User and Auth Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'tenant' | 'manager' | 'admin';
  phone?: string;
  avatar?: string;
}

// Lease Types
export interface Lease {
  id: string;
  propertyId: string;
  propertyName: string;
  startDate: string;
  endDate: string;
  rentAmount: number;
  dueDate: number;
  status: 'active' | 'pending' | 'ended' | 'terminated';
  tenants: Array<{
    id: string;
    name: string;
    email: string;
    phone: string;
  }>;
  terms: string[];
}

// Payment Types
export interface Payment {
  id: string;
  leaseId: string;
  amount: number;
  date: string;
  method: string;
  reference: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  type: 'rent' | 'deposit' | 'fee' | 'other';
  description?: string;
}

export interface PaymentFilters {
  startDate?: string;
  endDate?: string;
  status?: string;
  type?: string;
}

// Work Order Types
export interface WorkOrder {
  id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  assignedTo?: {
    id: string;
    name: string;
  };
  images?: string[];
  comments?: Array<{
    id: string;
    userId: string;
    userName: string;
    text: string;
    createdAt: string;
  }>;
}

// Document Types
export interface Document {
  id: string;
  name: string;
  type: 'lease' | 'invoice' | 'notice' | 'other';
  url: string;
  size: number;
  mimeType: string;
  createdAt: string;
  description?: string;
}

// Communication Types
export interface Communication {
  id: string;
  subject: string;
  message: string;
  type: 'email' | 'sms' | 'notification';
  status: 'sent' | 'delivered' | 'read' | 'failed';
  createdAt: string;
  readAt?: string;
  from: {
    id: string;
    name: string;
    type: 'tenant' | 'manager' | 'system';
  };
  to: Array<{
    id: string;
    name: string;
    type: 'tenant' | 'manager' | 'system';
  }>;
}

// Export all API types
export * from './api';

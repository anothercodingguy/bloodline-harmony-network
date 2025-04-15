
// User types
export type UserRole = 'admin' | 'donor' | 'requester';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: string;
  createdAt: Date;
}

export interface Donor extends User {
  bloodGroup: BloodGroup;
  lastDonation?: Date;
  age: number;
  weight?: number;
  medicalHistory?: string;
  isEligible: boolean;
}

// Blood-related types
export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface BloodUnit {
  id: string;
  bloodGroup: BloodGroup;
  donationId: string;
  donorId: string;
  collectedAt: Date;
  expiresAt: Date;
  status: 'available' | 'reserved' | 'used' | 'expired';
  location?: string;
}

export interface BloodInventoryItem {
  bloodGroup: BloodGroup;
  totalUnits: number;
  availableUnits: number;
  reservedUnits: number;
}

// Donation-related types
export interface Donation {
  id: string;
  donorId: string;
  donorName: string;
  bloodGroup: BloodGroup;
  quantity: number;
  donationDate: Date;
  location: string;
  status: 'completed' | 'pending' | 'rejected';
  healthNotes?: string;
}

// Request-related types
export interface BloodRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  patientName: string;
  bloodGroup: BloodGroup;
  quantity: number;
  requestDate: Date;
  requiredDate: Date;
  hospital: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'fulfilled';
  urgency: 'normal' | 'urgent' | 'emergency';
  adminNotes?: string;
}

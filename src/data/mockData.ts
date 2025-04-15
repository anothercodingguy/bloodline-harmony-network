
import { Donor, BloodInventoryItem, Donation, BloodRequest, BloodUnit, BloodGroup } from '@/models/types';

// Helper function to generate random dates
const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Mock Donors
export const mockDonors: Donor[] = [
  {
    id: '1',
    name: 'John Donor',
    email: 'john@example.com',
    role: 'donor',
    phone: '123-456-7890',
    address: '123 Main St, City',
    createdAt: new Date('2023-01-15'),
    bloodGroup: 'A+',
    lastDonation: new Date('2023-10-10'),
    age: 28,
    weight: 75,
    isEligible: true,
  },
  {
    id: '2',
    name: 'Sarah Smith',
    email: 'sarah@example.com',
    role: 'donor',
    phone: '987-654-3210',
    address: '456 Oak St, Town',
    createdAt: new Date('2023-02-20'),
    bloodGroup: 'O-',
    lastDonation: new Date('2023-11-05'),
    age: 35,
    weight: 68,
    isEligible: true,
  },
  {
    id: '3',
    name: 'Michael Johnson',
    email: 'michael@example.com',
    role: 'donor',
    phone: '555-123-4567',
    address: '789 Pine St, Village',
    createdAt: new Date('2023-03-10'),
    bloodGroup: 'B+',
    lastDonation: new Date('2023-09-15'),
    age: 42,
    weight: 82,
    isEligible: true,
  },
  {
    id: '4',
    name: 'Emily Davis',
    email: 'emily@example.com',
    role: 'donor',
    phone: '444-555-6666',
    address: '101 Cedar St, Hamlet',
    createdAt: new Date('2023-04-05'),
    bloodGroup: 'AB+',
    lastDonation: new Date('2023-08-20'),
    age: 31,
    weight: 65,
    isEligible: true,
  },
  {
    id: '5',
    name: 'Daniel Brown',
    email: 'daniel@example.com',
    role: 'donor',
    phone: '222-333-4444',
    address: '202 Birch St, Borough',
    createdAt: new Date('2023-05-12'),
    bloodGroup: 'A-',
    lastDonation: new Date('2023-07-25'),
    age: 39,
    weight: 78,
    isEligible: false,
  },
];

// Mock Blood Inventory
export const mockBloodInventory: BloodInventoryItem[] = [
  { bloodGroup: 'A+', totalUnits: 25, availableUnits: 18, reservedUnits: 7 },
  { bloodGroup: 'A-', totalUnits: 10, availableUnits: 8, reservedUnits: 2 },
  { bloodGroup: 'B+', totalUnits: 15, availableUnits: 12, reservedUnits: 3 },
  { bloodGroup: 'B-', totalUnits: 8, availableUnits: 5, reservedUnits: 3 },
  { bloodGroup: 'AB+', totalUnits: 12, availableUnits: 10, reservedUnits: 2 },
  { bloodGroup: 'AB-', totalUnits: 5, availableUnits: 4, reservedUnits: 1 },
  { bloodGroup: 'O+', totalUnits: 30, availableUnits: 20, reservedUnits: 10 },
  { bloodGroup: 'O-', totalUnits: 20, availableUnits: 12, reservedUnits: 8 },
];

// Mock Blood Units
export const mockBloodUnits: BloodUnit[] = Array.from({ length: 50 }, (_, i) => {
  const bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const statuses: BloodUnit['status'][] = ['available', 'reserved', 'used', 'expired'];
  const randomBloodGroup = bloodGroups[Math.floor(Math.random() * bloodGroups.length)];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
  const donorId = String(Math.floor(Math.random() * 5) + 1);
  const collectedDate = randomDate(new Date(2023, 0, 1), new Date());
  const expiryDate = new Date(collectedDate);
  expiryDate.setDate(expiryDate.getDate() + 42); // Blood expires after 42 days
  
  return {
    id: `unit-${i + 1}`,
    bloodGroup: randomBloodGroup,
    donationId: `donation-${Math.floor(Math.random() * 20) + 1}`,
    donorId,
    collectedAt: collectedDate,
    expiresAt: expiryDate,
    status: randomStatus,
    location: ['Central Blood Bank', 'North Hospital', 'South Medical Center', 'East Clinic', 'West Hospital'][Math.floor(Math.random() * 5)],
  };
});

// Mock Donations
export const mockDonations: Donation[] = Array.from({ length: 20 }, (_, i) => {
  const donorIndex = Math.floor(Math.random() * mockDonors.length);
  const donor = mockDonors[donorIndex];
  const donationDate = randomDate(new Date(2023, 0, 1), new Date());
  const statuses: Donation['status'][] = ['completed', 'pending', 'rejected'];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
  
  return {
    id: `donation-${i + 1}`,
    donorId: donor.id,
    donorName: donor.name,
    bloodGroup: donor.bloodGroup,
    quantity: Math.floor(Math.random() * 2) + 1, // 1-2 units
    donationDate,
    location: ['Central Blood Bank', 'North Hospital', 'South Medical Center', 'East Clinic', 'West Hospital'][Math.floor(Math.random() * 5)],
    status: randomStatus,
    healthNotes: randomStatus === 'rejected' ? 'Low hemoglobin levels' : undefined,
  };
});

// Mock Blood Requests
export const mockBloodRequests: BloodRequest[] = Array.from({ length: 15 }, (_, i) => {
  const bloodGroups: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const randomBloodGroup = bloodGroups[Math.floor(Math.random() * bloodGroups.length)];
  const requestDate = randomDate(new Date(2023, 0, 1), new Date());
  const requiredDate = new Date(requestDate);
  requiredDate.setDate(requestDate.getDate() + Math.floor(Math.random() * 7) + 1);
  const statuses: BloodRequest['status'][] = ['pending', 'approved', 'rejected', 'fulfilled'];
  const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
  const urgencies: BloodRequest['urgency'][] = ['normal', 'urgent', 'emergency'];
  const randomUrgency = urgencies[Math.floor(Math.random() * urgencies.length)];
  
  return {
    id: `request-${i + 1}`,
    requesterId: `requester-${Math.floor(Math.random() * 10) + 1}`,
    requesterName: ['Alex Johnson', 'Maria Rodriguez', 'David Kim', 'Priya Patel', 'Omar Hassan'][Math.floor(Math.random() * 5)],
    patientName: ['Patient A', 'Patient B', 'Patient C', 'Patient D', 'Patient E'][Math.floor(Math.random() * 5)],
    bloodGroup: randomBloodGroup,
    quantity: Math.floor(Math.random() * 3) + 1, // 1-3 units
    requestDate,
    requiredDate,
    hospital: ['City Hospital', 'General Medical Center', 'University Hospital', 'Memorial Hospital', 'Community Medical'][Math.floor(Math.random() * 5)],
    reason: ['Surgery', 'Accident', 'Anemia', 'Childbirth', 'Cancer Treatment'][Math.floor(Math.random() * 5)],
    status: randomStatus,
    urgency: randomUrgency,
    adminNotes: randomStatus === 'rejected' ? 'No matching blood available' : undefined,
  };
});

// Utility function to get donation statistics
export const getDonationStats = () => {
  const totalDonations = mockDonations.length;
  const completedDonations = mockDonations.filter(d => d.status === 'completed').length;
  const pendingDonations = mockDonations.filter(d => d.status === 'pending').length;
  const rejectedDonations = mockDonations.filter(d => d.status === 'rejected').length;
  
  return {
    totalDonations,
    completedDonations,
    pendingDonations,
    rejectedDonations,
  };
};

// Utility function to get request statistics
export const getRequestStats = () => {
  const totalRequests = mockBloodRequests.length;
  const pendingRequests = mockBloodRequests.filter(r => r.status === 'pending').length;
  const approvedRequests = mockBloodRequests.filter(r => r.status === 'approved').length;
  const fulfilledRequests = mockBloodRequests.filter(r => r.status === 'fulfilled').length;
  const rejectedRequests = mockBloodRequests.filter(r => r.status === 'rejected').length;
  
  return {
    totalRequests,
    pendingRequests,
    approvedRequests,
    fulfilledRequests,
    rejectedRequests,
  };
};

// Utility function to get inventory statistics
export const getInventoryStats = () => {
  const totalUnits = mockBloodInventory.reduce((sum, item) => sum + item.totalUnits, 0);
  const availableUnits = mockBloodInventory.reduce((sum, item) => sum + item.availableUnits, 0);
  const reservedUnits = mockBloodInventory.reduce((sum, item) => sum + item.reservedUnits, 0);
  const criticalLevels = mockBloodInventory.filter(item => item.availableUnits < 5).map(item => item.bloodGroup);
  
  return {
    totalUnits,
    availableUnits,
    reservedUnits,
    criticalLevels,
  };
};

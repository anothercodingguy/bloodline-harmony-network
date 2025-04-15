
import { BloodInventoryItem, BloodUnit, BloodGroup, BloodRequest, Donation } from '@/models/types';
import { mockBloodInventory, mockBloodUnits, mockBloodRequests, mockDonations } from '@/data/mockData';

// Blood Inventory Services
export const getBloodInventory = (): Promise<BloodInventoryItem[]> => {
  return Promise.resolve([...mockBloodInventory]);
};

export const getBloodUnitsByGroup = (bloodGroup: BloodGroup): Promise<BloodUnit[]> => {
  const units = mockBloodUnits.filter(unit => unit.bloodGroup === bloodGroup);
  return Promise.resolve([...units]);
};

export const getAllBloodUnits = (): Promise<BloodUnit[]> => {
  return Promise.resolve([...mockBloodUnits]);
};

// Blood Request Services
export const getAllBloodRequests = (): Promise<BloodRequest[]> => {
  return Promise.resolve([...mockBloodRequests]);
};

export const getPendingBloodRequests = (): Promise<BloodRequest[]> => {
  const requests = mockBloodRequests.filter(request => request.status === 'pending');
  return Promise.resolve([...requests]);
};

export const getBloodRequestsByUser = (userId: string): Promise<BloodRequest[]> => {
  const requests = mockBloodRequests.filter(request => request.requesterId === userId);
  return Promise.resolve([...requests]);
};

export const createBloodRequest = (request: Omit<BloodRequest, 'id'>): Promise<BloodRequest> => {
  const newRequest = {
    ...request,
    id: `request-${mockBloodRequests.length + 1}`,
  };
  
  mockBloodRequests.push(newRequest as BloodRequest);
  return Promise.resolve(newRequest as BloodRequest);
};

export const updateBloodRequestStatus = (
  requestId: string,
  status: BloodRequest['status'],
  adminNotes?: string
): Promise<BloodRequest> => {
  const requestIndex = mockBloodRequests.findIndex(r => r.id === requestId);
  
  if (requestIndex === -1) {
    return Promise.reject(new Error('Blood request not found'));
  }
  
  mockBloodRequests[requestIndex] = {
    ...mockBloodRequests[requestIndex],
    status,
    adminNotes: adminNotes || mockBloodRequests[requestIndex].adminNotes,
  };
  
  return Promise.resolve(mockBloodRequests[requestIndex]);
};

// Donation Services
export const getAllDonations = (): Promise<Donation[]> => {
  return Promise.resolve([...mockDonations]);
};

export const getDonationsByDonor = (donorId: string): Promise<Donation[]> => {
  const donations = mockDonations.filter(donation => donation.donorId === donorId);
  return Promise.resolve([...donations]);
};

export const createDonation = (donation: Omit<Donation, 'id'>): Promise<Donation> => {
  const newDonation = {
    ...donation,
    id: `donation-${mockDonations.length + 1}`,
  };
  
  mockDonations.push(newDonation as Donation);
  return Promise.resolve(newDonation as Donation);
};

export const updateDonationStatus = (
  donationId: string,
  status: Donation['status'],
  healthNotes?: string
): Promise<Donation> => {
  const donationIndex = mockDonations.findIndex(d => d.id === donationId);
  
  if (donationIndex === -1) {
    return Promise.reject(new Error('Donation not found'));
  }
  
  mockDonations[donationIndex] = {
    ...mockDonations[donationIndex],
    status,
    healthNotes: healthNotes || mockDonations[donationIndex].healthNotes,
  };
  
  // If donation is completed, add blood units to inventory
  if (status === 'completed') {
    const donation = mockDonations[donationIndex];
    
    // Create blood units
    for (let i = 0; i < donation.quantity; i++) {
      const collectedAt = new Date();
      const expiresAt = new Date(collectedAt);
      expiresAt.setDate(expiresAt.getDate() + 42); // Blood expires after 42 days
      
      const newUnit: BloodUnit = {
        id: `unit-${mockBloodUnits.length + 1 + i}`,
        bloodGroup: donation.bloodGroup,
        donationId: donation.id,
        donorId: donation.donorId,
        collectedAt,
        expiresAt,
        status: 'available',
        location: donation.location,
      };
      
      mockBloodUnits.push(newUnit);
    }
    
    // Update inventory
    const inventoryIndex = mockBloodInventory.findIndex(
      item => item.bloodGroup === donation.bloodGroup
    );
    
    if (inventoryIndex !== -1) {
      mockBloodInventory[inventoryIndex].totalUnits += donation.quantity;
      mockBloodInventory[inventoryIndex].availableUnits += donation.quantity;
    }
  }
  
  return Promise.resolve(mockDonations[donationIndex]);
};

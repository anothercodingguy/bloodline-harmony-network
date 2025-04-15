
import { User, Donor } from '@/models/types';
import { mockDonors } from '@/data/mockData';

export const getAllDonors = (): Promise<Donor[]> => {
  return Promise.resolve([...mockDonors]);
};

export const getDonorById = (id: string): Promise<Donor | null> => {
  const donor = mockDonors.find(d => d.id === id);
  return Promise.resolve(donor || null);
};

export const searchDonors = (query: string): Promise<Donor[]> => {
  query = query.toLowerCase();
  const donors = mockDonors.filter(donor => 
    donor.name.toLowerCase().includes(query) ||
    donor.bloodGroup.toLowerCase().includes(query) ||
    (donor.address && donor.address.toLowerCase().includes(query))
  );
  return Promise.resolve([...donors]);
};

export const searchDonorsByBloodGroup = (bloodGroup: string): Promise<Donor[]> => {
  const donors = mockDonors.filter(donor => 
    donor.bloodGroup.toLowerCase() === bloodGroup.toLowerCase()
  );
  return Promise.resolve([...donors]);
};

export const updateDonor = (id: string, data: Partial<Donor>): Promise<Donor> => {
  const index = mockDonors.findIndex(d => d.id === id);
  
  if (index === -1) {
    return Promise.reject(new Error('Donor not found'));
  }
  
  mockDonors[index] = {
    ...mockDonors[index],
    ...data,
  };
  
  return Promise.resolve(mockDonors[index]);
};

export const createDonor = (data: Omit<Donor, 'id' | 'role' | 'createdAt'>): Promise<Donor> => {
  const newDonor: Donor = {
    id: `donor-${mockDonors.length + 1}`,
    role: 'donor',
    createdAt: new Date(),
    ...data,
  };
  
  mockDonors.push(newDonor);
  return Promise.resolve(newDonor);
};

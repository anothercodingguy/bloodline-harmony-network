
import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { BloodUnitBadge } from '@/components/BloodUnitBadge';
import { StatusBadge } from '@/components/StatusBadge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter, CalendarIcon, DownloadIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getAllDonations, getDonationsByDonor } from '@/services/bloodService';
import { Donation } from '@/models/types';
import { StatsCard } from '@/components/StatsCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const DonationHistory = () => {
  const { user, role } = useAuth();
  const [donations, setDonations] = useState<Donation[]>([]);
  const [filteredDonations, setFilteredDonations] = useState<Donation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDonations = async () => {
      try {
        let data: Donation[];
        
        if (role === 'donor' && user) {
          data = await getDonationsByDonor(user.id);
        } else {
          data = await getAllDonations();
        }
        
        setDonations(data);
        setFilteredDonations(data);
      } catch (error) {
        console.error('Error fetching donations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDonations();
  }, [user, role]);

  useEffect(() => {
    // Apply filters
    let result = donations;
    
    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(donation => donation.status === statusFilter);
    }
    
    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const pastDate = new Date();
      
      switch (dateFilter) {
        case 'last7':
          pastDate.setDate(now.getDate() - 7);
          result = result.filter(
            donation => new Date(donation.donationDate) >= pastDate
          );
          break;
        case 'last30':
          pastDate.setDate(now.getDate() - 30);
          result = result.filter(
            donation => new Date(donation.donationDate) >= pastDate
          );
          break;
        case 'last90':
          pastDate.setDate(now.getDate() - 90);
          result = result.filter(
            donation => new Date(donation.donationDate) >= pastDate
          );
          break;
        case 'thisYear':
          pastDate.setMonth(0, 1);
          pastDate.setHours(0, 0, 0, 0);
          result = result.filter(
            donation => new Date(donation.donationDate) >= pastDate
          );
          break;
      }
    }
    
    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(donation => 
        donation.donorName.toLowerCase().includes(query) ||
        donation.bloodGroup.toLowerCase().includes(query) ||
        donation.location.toLowerCase().includes(query)
      );
    }
    
    setFilteredDonations(result);
  }, [searchQuery, statusFilter, dateFilter, donations]);

  // Calculate stats
  const totalDonations = donations.length;
  const completedDonations = donations.filter(d => d.status === 'completed').length;
  const pendingDonations = donations.filter(d => d.status === 'pending').length;
  const rejectedDonations = donations.filter(d => d.status === 'rejected').length;
  
  const totalUnits = donations.reduce((sum, donation) => sum + donation.quantity, 0);
  const completedUnits = donations
    .filter(d => d.status === 'completed')
    .reduce((sum, donation) => sum + donation.quantity, 0);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const exportToCsv = () => {
    // Generate CSV content
    const headers = ['Donor Name', 'Blood Group', 'Quantity', 'Donation Date', 'Location', 'Status'];
    
    const csvContent = [
      headers.join(','),
      ...filteredDonations.map(d => [
        `"${d.donorName}"`,
        d.bloodGroup,
        d.quantity,
        formatDate(d.donationDate),
        `"${d.location}"`,
        d.status
      ].join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `donation_history_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout title="Donation History">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard 
          title="Total Donations" 
          value={totalDonations}
          icon={<CalendarIcon className="h-5 w-5" />}
        />
        
        <StatsCard 
          title="Completed" 
          value={completedDonations}
          description={`${completedUnits} units of blood`}
        />
        
        <StatsCard 
          title="Pending" 
          value={pendingDonations}
        />
        
        <StatsCard 
          title="Rejected" 
          value={rejectedDonations}
        />
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Donation Records</CardTitle>
              <CardDescription>
                {role === 'donor'
                  ? 'History of your blood donations'
                  : 'Complete history of all blood donations'}
              </CardDescription>
            </div>
            
            {role === 'admin' && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={exportToCsv}
                className="mt-2 md:mt-0"
              >
                <DownloadIcon className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by donor, blood group or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Date Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="last7">Last 7 Days</SelectItem>
                    <SelectItem value="last30">Last 30 Days</SelectItem>
                    <SelectItem value="last90">Last 90 Days</SelectItem>
                    <SelectItem value="thisYear">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Donor</TableHead>
                  <TableHead>Blood Group</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Donation Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDonations.length > 0 ? (
                  filteredDonations.map((donation) => (
                    <TableRow key={donation.id}>
                      <TableCell>{donation.donorName}</TableCell>
                      <TableCell>
                        <BloodUnitBadge bloodGroup={donation.bloodGroup} />
                      </TableCell>
                      <TableCell>{donation.quantity} unit(s)</TableCell>
                      <TableCell>{formatDate(donation.donationDate)}</TableCell>
                      <TableCell>{donation.location}</TableCell>
                      <TableCell>
                        <StatusBadge status={donation.status} />
                        {donation.status === 'rejected' && donation.healthNotes && (
                          <span className="block text-xs text-muted-foreground mt-1">
                            Reason: {donation.healthNotes}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No donation records found matching your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default DonationHistory;

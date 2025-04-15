
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
import { Search, Filter, DownloadIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getAllBloodRequests, getBloodRequestsByUser } from '@/services/bloodService';
import { BloodRequest } from '@/models/types';
import { StatsCard } from '@/components/StatsCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const RequestHistory = () => {
  const { user, role } = useAuth();
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<BloodRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [urgencyFilter, setUrgencyFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        let data: BloodRequest[];
        
        if (role === 'requester' && user) {
          data = await getBloodRequestsByUser(user.id);
        } else {
          data = await getAllBloodRequests();
        }
        
        setRequests(data);
        setFilteredRequests(data);
      } catch (error) {
        console.error('Error fetching requests:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, [user, role]);

  useEffect(() => {
    // Apply filters
    let result = requests;
    
    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(request => request.status === statusFilter);
    }
    
    // Urgency filter
    if (urgencyFilter !== 'all') {
      result = result.filter(request => request.urgency === urgencyFilter);
    }
    
    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(request => 
        request.patientName.toLowerCase().includes(query) ||
        request.bloodGroup.toLowerCase().includes(query) ||
        request.hospital.toLowerCase().includes(query) ||
        request.requesterName.toLowerCase().includes(query)
      );
    }
    
    setFilteredRequests(result);
  }, [searchQuery, statusFilter, urgencyFilter, requests]);

  // Calculate stats
  const totalRequests = requests.length;
  const pendingRequests = requests.filter(r => r.status === 'pending').length;
  const approvedRequests = requests.filter(r => r.status === 'approved').length;
  const fulfilledRequests = requests.filter(r => r.status === 'fulfilled').length;
  const rejectedRequests = requests.filter(r => r.status === 'rejected').length;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const exportToCsv = () => {
    // Generate CSV content
    const headers = ['Patient', 'Requester', 'Blood Group', 'Quantity', 'Hospital', 'Request Date', 'Required Date', 'Status', 'Urgency'];
    
    const csvContent = [
      headers.join(','),
      ...filteredRequests.map(r => [
        `"${r.patientName}"`,
        `"${r.requesterName}"`,
        r.bloodGroup,
        r.quantity,
        `"${r.hospital}"`,
        formatDate(r.requestDate),
        formatDate(r.requiredDate),
        r.status,
        r.urgency
      ].join(','))
    ].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `request_history_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout title="Request History">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
        <StatsCard 
          title="Total Requests" 
          value={totalRequests}
        />
        
        <StatsCard 
          title="Pending" 
          value={pendingRequests}
        />
        
        <StatsCard 
          title="Approved" 
          value={approvedRequests}
        />
        
        <StatsCard 
          title="Fulfilled" 
          value={fulfilledRequests}
        />
        
        <StatsCard 
          title="Rejected" 
          value={rejectedRequests}
        />
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Blood Request Records</CardTitle>
              <CardDescription>
                {role === 'requester'
                  ? 'History of your blood requests'
                  : 'Complete history of all blood requests'}
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
                placeholder="Search by patient, blood group or hospital..."
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
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="fulfilled">Fulfilled</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Urgency</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  {role !== 'requester' && <TableHead>Requester</TableHead>}
                  <TableHead>Blood Group</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Hospital</TableHead>
                  <TableHead>Required Date</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Urgency</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>{request.patientName}</TableCell>
                      {role !== 'requester' && <TableCell>{request.requesterName}</TableCell>}
                      <TableCell>
                        <BloodUnitBadge bloodGroup={request.bloodGroup} />
                      </TableCell>
                      <TableCell>{request.quantity} unit(s)</TableCell>
                      <TableCell>{request.hospital}</TableCell>
                      <TableCell>{formatDate(request.requiredDate)}</TableCell>
                      <TableCell>
                        <span className="line-clamp-1 max-w-[150px]" title={request.reason}>
                          {request.reason}
                        </span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={request.status} />
                        {request.status === 'rejected' && request.adminNotes && (
                          <span className="block text-xs text-muted-foreground mt-1">
                            Reason: {request.adminNotes}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={request.urgency} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={role !== 'requester' ? 9 : 8} className="text-center py-8 text-muted-foreground">
                      No request records found matching your filters.
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

export default RequestHistory;

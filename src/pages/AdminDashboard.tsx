
import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/StatsCard';
import { ProgressCard } from '@/components/ProgressCard';
import { BloodUnitBadge } from '@/components/BloodUnitBadge';
import { StatusBadge } from '@/components/StatusBadge';
import { Link } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { getBloodInventory, getPendingBloodRequests, getAllDonations, updateBloodRequestStatus } from '@/services/bloodService';
import { BloodInventoryItem, BloodRequest, Donation } from '@/models/types';
import { getAllDonors } from '@/services/userService';
import {
  DropletIcon,
  AlertTriangleIcon,
  UserPlusIcon,
  CheckIcon,
  XIcon,
  BarChart4Icon,
  UsersIcon,
  ClipboardListIcon,
  AlertCircleIcon,
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const AdminDashboard = () => {
  const { toast } = useToast();
  const [bloodInventory, setBloodInventory] = useState<BloodInventoryItem[]>([]);
  const [pendingRequests, setPendingRequests] = useState<BloodRequest[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [donorCount, setDonorCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [inventoryData, requestsData, donationsData, donorsData] = await Promise.all([
        getBloodInventory(),
        getPendingBloodRequests(),
        getAllDonations(),
        getAllDonors(),
      ]);
      
      setBloodInventory(inventoryData);
      setPendingRequests(requestsData);
      setDonations(donationsData);
      setDonorCount(donorsData.length);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await updateBloodRequestStatus(requestId, 'approved');
      toast({
        title: 'Request Approved',
        description: 'The blood request has been approved successfully',
      });
      fetchData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve request',
        variant: 'destructive',
      });
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await updateBloodRequestStatus(
        requestId, 
        'rejected', 
        'Insufficient blood units available'
      );
      toast({
        title: 'Request Rejected',
        description: 'The blood request has been rejected',
      });
      fetchData();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject request',
        variant: 'destructive',
      });
    }
  };

  // Calculate stats
  const totalUnits = bloodInventory.reduce((sum, item) => sum + item.totalUnits, 0);
  const availableUnits = bloodInventory.reduce((sum, item) => sum + item.availableUnits, 0);
  const reservedUnits = bloodInventory.reduce((sum, item) => sum + item.reservedUnits, 0);
  
  const completedDonations = donations.filter(d => d.status === 'completed').length;
  const pendingDonations = donations.filter(d => d.status === 'pending').length;
  
  const criticalBloodTypes = bloodInventory
    .filter(item => item.availableUnits < 5)
    .map(item => item.bloodGroup);

  // Prepare chart data
  const inventoryChartData = bloodInventory.map(item => ({
    name: item.bloodGroup,
    available: item.availableUnits,
    reserved: item.reservedUnits,
  }));

  const donationStatusData = [
    { name: 'Completed', value: completedDonations },
    { name: 'Pending', value: pendingDonations },
    { name: 'Rejected', value: donations.length - completedDonations - pendingDonations },
  ];

  const COLORS = ['#10B981', '#F59E0B', '#EF4444'];

  return (
    <DashboardLayout title="Admin Dashboard">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatsCard 
          title="Total Blood Units" 
          value={totalUnits}
          description={`${availableUnits} available, ${reservedUnits} reserved`}
          icon={<DropletIcon className="h-5 w-5" />}
        />
        
        <StatsCard 
          title="Pending Requests" 
          value={pendingRequests.length}
          icon={<ClipboardListIcon className="h-5 w-5" />}
        />
        
        <StatsCard 
          title="Registered Donors" 
          value={donorCount}
          icon={<UsersIcon className="h-5 w-5" />}
        />
        
        <StatsCard 
          title="Total Donations" 
          value={donations.length}
          description={`${completedDonations} completed, ${pendingDonations} pending`}
          icon={<BarChart4Icon className="h-5 w-5" />}
        />
      </div>

      {/* Critical Blood Types Alert */}
      {criticalBloodTypes.length > 0 && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start">
              <AlertCircleIcon className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Critical Inventory Alert</h3>
                <p className="text-sm text-red-700 mt-1">
                  Low blood levels for: {criticalBloodTypes.map(type => (
                    <BloodUnitBadge key={type} bloodGroup={type} className="ml-1" />
                  ))}
                </p>
                <div className="mt-2">
                  <Button size="sm" variant="secondary" className="bg-white" asChild>
                    <Link to="/donor-registration">Register New Donor</Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upper Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Blood Inventory Overview */}
        <Card className="col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <DropletIcon className="h-5 w-5 mr-2 text-blood-500" /> 
              Blood Inventory
            </CardTitle>
            <CardDescription>Current blood stock levels</CardDescription>
          </CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={inventoryChartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="available" name="Available" fill="#10B981" />
                <Bar dataKey="reserved" name="Reserved" fill="#F59E0B" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Donation Status */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <BarChart4Icon className="h-5 w-5 mr-2 text-blood-500" />
              Donation Status
            </CardTitle>
            <CardDescription>Overview of donation statuses</CardDescription>
          </CardHeader>
          <CardContent className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donationStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {donationStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} donations`, 'Count']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Lower Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pending Requests */}
        <Card className="col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <ClipboardListIcon className="h-5 w-5 mr-2 text-blood-500" />
              Pending Blood Requests
            </CardTitle>
            <CardDescription>Requests that need your approval</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingRequests.length > 0 ? (
              <div className="space-y-4">
                {pendingRequests.slice(0, 5).map((request) => (
                  <div 
                    key={request.id} 
                    className="p-4 border rounded-md flex flex-col md:flex-row md:items-center md:justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center flex-wrap gap-2">
                        <BloodUnitBadge bloodGroup={request.bloodGroup} />
                        <span className="font-medium">
                          {request.quantity} unit(s) for {request.patientName}
                        </span>
                        <StatusBadge status={request.urgency} />
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        Requested by: {request.requesterName} • {new Date(request.requestDate).toLocaleDateString()} • {request.hospital}
                      </div>
                      <div className="text-sm mt-1">
                        Reason: {request.reason}
                      </div>
                    </div>
                    <div className="flex gap-2 self-end md:self-center">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleRejectRequest(request.id)}
                      >
                        <XIcon className="h-4 w-4 mr-1" /> Reject
                      </Button>
                      <Button 
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => handleAcceptRequest(request.id)}
                      >
                        <CheckIcon className="h-4 w-4 mr-1" /> Approve
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No pending requests at the moment.</p>
              </div>
            )}
            
            {pendingRequests.length > 5 && (
              <div className="mt-4 flex justify-end">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/blood-requests">View All Requests</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons and Critical Levels */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <AlertTriangleIcon className="h-5 w-5 mr-2 text-blood-500" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common administrative tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full justify-start" asChild>
              <Link to="/donor-registration">
                <UserPlusIcon className="mr-2 h-4 w-4" />
                Register New Donor
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link to="/blood-inventory">
                <DropletIcon className="mr-2 h-4 w-4" />
                Manage Blood Inventory
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link to="/blood-requests">
                <ClipboardListIcon className="mr-2 h-4 w-4" />
                View All Blood Requests
              </Link>
            </Button>
            <Button className="w-full justify-start" variant="outline" asChild>
              <Link to="/search">
                <UsersIcon className="mr-2 h-4 w-4" />
                Search Donors
              </Link>
            </Button>

            <div className="pt-4 border-t">
              <h3 className="font-medium mb-2">Critical Blood Levels</h3>
              {criticalBloodTypes.length > 0 ? (
                <div className="space-y-2">
                  {bloodInventory
                    .filter(item => item.availableUnits < 5)
                    .map(item => (
                      <ProgressCard
                        key={item.bloodGroup}
                        title={`${item.bloodGroup} Blood`}
                        current={item.availableUnits}
                        max={20}
                        colorClass={item.availableUnits < 3 ? "bg-red-500" : "bg-amber-500"}
                      />
                    ))
                  }
                </div>
              ) : (
                <p className="text-sm text-green-600">All blood types at healthy levels</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;

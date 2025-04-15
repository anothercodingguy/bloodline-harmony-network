
import React, { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/StatsCard';
import { BloodUnitBadge } from '@/components/BloodUnitBadge';
import { StatusBadge } from '@/components/StatusBadge';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getBloodInventory, getAllBloodRequests, getAllDonations } from '@/services/bloodService';
import { BloodInventoryItem, BloodRequest, Donation } from '@/models/types';
import {
  DropletIcon,
  AlertCircleIcon,
  UserPlusIcon,
  CalendarIcon,
  ClipboardCheckIcon,
  ClipboardListIcon,
  SearchIcon,
} from 'lucide-react';

const Dashboard = () => {
  const { user, role } = useAuth();
  const [bloodInventory, setBloodInventory] = useState<BloodInventoryItem[]>([]);
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [inventoryData, requestsData, donationsData] = await Promise.all([
          getBloodInventory(),
          getAllBloodRequests(),
          getAllDonations(),
        ]);
        
        setBloodInventory(inventoryData);
        // Filter requests based on user role
        if (role === 'requester') {
          setRequests(requestsData.filter(req => req.requesterId === user?.id));
        } else {
          setRequests(requestsData);
        }
        
        // Filter donations based on user role
        if (role === 'donor') {
          setDonations(donationsData.filter(donation => donation.donorId === user?.id));
        } else {
          setDonations(donationsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, role]);

  // Calculate stats
  const totalAvailableUnits = bloodInventory.reduce((sum, item) => sum + item.availableUnits, 0);
  const pendingRequests = requests.filter(req => req.status === 'pending').length;
  const criticalBloodTypes = bloodInventory
    .filter(item => item.availableUnits < 5)
    .map(item => item.bloodGroup);

  // Get most recent requests and donations
  const recentRequests = [...requests]
    .sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime())
    .slice(0, 5);
    
  const recentDonations = [...donations]
    .sort((a, b) => new Date(b.donationDate).getTime() - new Date(a.donationDate).getTime())
    .slice(0, 5);

  return (
    <DashboardLayout title="Dashboard">
      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {role === 'donor' || role === 'admin' ? (
          <Button className="flex items-center justify-center bg-blood-600 hover:bg-blood-700" asChild>
            <Link to="/donor-registration">
              <UserPlusIcon className="mr-2 h-4 w-4" />
              Donate Blood
            </Link>
          </Button>
        ) : null}
        
        <Button className="flex items-center justify-center" asChild>
          <Link to="/blood-requests">
            <ClipboardListIcon className="mr-2 h-4 w-4" />
            Request Blood
          </Link>
        </Button>
        
        <Button variant="outline" className="flex items-center justify-center" asChild>
          <Link to="/blood-inventory">
            <DropletIcon className="mr-2 h-4 w-4" />
            View Inventory
          </Link>
        </Button>
        
        <Button variant="outline" className="flex items-center justify-center" asChild>
          <Link to="/search">
            <SearchIcon className="mr-2 h-4 w-4" />
            Search
          </Link>
        </Button>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatsCard 
          title="Available Blood Units" 
          value={totalAvailableUnits}
          icon={<DropletIcon className="h-5 w-5" />}
        />
        
        <StatsCard 
          title="Pending Requests" 
          value={pendingRequests}
          icon={<ClipboardCheckIcon className="h-5 w-5" />}
        />
        
        {role === 'donor' ? (
          <StatsCard 
            title="Your Donations" 
            value={donations.length}
            icon={<CalendarIcon className="h-5 w-5" />}
          />
        ) : role === 'requester' ? (
          <StatsCard 
            title="Your Requests" 
            value={requests.length}
            icon={<ClipboardListIcon className="h-5 w-5" />}
          />
        ) : (
          <StatsCard 
            title="Total Donations" 
            value={donations.length}
            icon={<CalendarIcon className="h-5 w-5" />}
          />
        )}
      </div>

      {/* Critical Blood Types Alert */}
      {criticalBloodTypes.length > 0 && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start">
              <AlertCircleIcon className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Low Inventory Alert</h3>
                <p className="text-sm text-red-700 mt-1">
                  Critical blood levels for: {criticalBloodTypes.map(type => (
                    <BloodUnitBadge key={type} bloodGroup={type} className="ml-1" />
                  ))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Blood Inventory Overview */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <DropletIcon className="h-5 w-5 mr-2 text-blood-500" />
              Blood Inventory
            </CardTitle>
            <CardDescription>Current blood stock levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2">
              {bloodInventory.map((item) => (
                <div 
                  key={item.bloodGroup}
                  className="p-2 text-center rounded-md border"
                >
                  <BloodUnitBadge bloodGroup={item.bloodGroup} size="lg" className="mb-2" />
                  <div className="text-xl font-bold">{item.availableUnits}</div>
                  <div className="text-xs text-muted-foreground">units</div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <Button variant="outline" size="sm" asChild>
                <Link to="/blood-inventory">View Details</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity Section */}
        {role === 'donor' ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2 text-blood-500" />
                Your Recent Donations
              </CardTitle>
              <CardDescription>History of your blood donations</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              {recentDonations.length > 0 ? (
                <div className="space-y-4">
                  {recentDonations.map((donation) => (
                    <div key={donation.id} className="px-6 py-2 flex items-center justify-between">
                      <div>
                        <div className="flex items-center">
                          <BloodUnitBadge bloodGroup={donation.bloodGroup} className="mr-2" />
                          <span className="font-medium">{donation.quantity} unit(s)</span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {new Date(donation.donationDate).toLocaleDateString()}
                        </div>
                      </div>
                      <StatusBadge status={donation.status} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 px-6">
                  <p className="text-muted-foreground">No donation history found.</p>
                </div>
              )}
              <div className="mt-4 px-6 flex justify-end">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/donation-history">View All</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center">
                <ClipboardListIcon className="h-5 w-5 mr-2 text-blood-500" />
                {role === 'requester' ? 'Your Recent Requests' : 'Recent Blood Requests'}
              </CardTitle>
              <CardDescription>
                {role === 'requester' ? 'Status of your blood requests' : 'Recently submitted blood requests'}
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0">
              {recentRequests.length > 0 ? (
                <div className="space-y-4">
                  {recentRequests.map((request) => (
                    <div key={request.id} className="px-6 py-2 flex items-center justify-between">
                      <div>
                        <div className="flex items-center">
                          <BloodUnitBadge bloodGroup={request.bloodGroup} className="mr-2" />
                          <span className="font-medium">
                            {request.quantity} unit(s) for {request.patientName}
                          </span>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {new Date(request.requestDate).toLocaleDateString()} • {request.hospital}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <StatusBadge status={request.urgency} />
                        <StatusBadge status={request.status} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 px-6">
                  <p className="text-muted-foreground">No blood requests found.</p>
                </div>
              )}
              <div className="mt-4 px-6 flex justify-end">
                <Button variant="outline" size="sm" asChild>
                  <Link to={role === 'requester' ? '/request-history' : '/blood-requests'}>
                    View All
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;

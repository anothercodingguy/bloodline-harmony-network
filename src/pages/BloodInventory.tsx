
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
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BloodUnitBadge } from '@/components/BloodUnitBadge';
import { StatusBadge } from '@/components/StatusBadge';
import { getBloodInventory, getAllBloodUnits } from '@/services/bloodService';
import { BloodUnit, BloodInventoryItem } from '@/models/types';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Filter } from 'lucide-react';
import { ProgressCard } from '@/components/ProgressCard';

const BloodInventory = () => {
  const { role } = useAuth();
  const [bloodInventory, setBloodInventory] = useState<BloodInventoryItem[]>([]);
  const [bloodUnits, setBloodUnits] = useState<BloodUnit[]>([]);
  const [filteredUnits, setFilteredUnits] = useState<BloodUnit[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [inventoryData, unitsData] = await Promise.all([
          getBloodInventory(),
          getAllBloodUnits(),
        ]);
        setBloodInventory(inventoryData);
        setBloodUnits(unitsData);
        setFilteredUnits(unitsData);
      } catch (error) {
        console.error('Error fetching blood inventory data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Apply filters
    let result = bloodUnits;
    
    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(unit => unit.status === statusFilter);
    }
    
    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(unit => 
        unit.bloodGroup.toLowerCase().includes(query) ||
        unit.donorId.toLowerCase().includes(query) ||
        unit.location?.toLowerCase().includes(query)
      );
    }
    
    setFilteredUnits(result);
  }, [searchQuery, statusFilter, bloodUnits]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const daysUntilExpiry = (expiryDate: Date) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <DashboardLayout title="Blood Inventory">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {bloodInventory.map(item => (
          <Card key={item.bloodGroup}>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center mb-3">
                <BloodUnitBadge bloodGroup={item.bloodGroup} size="lg" />
                <span className="text-2xl font-bold">{item.availableUnits}</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Available</span>
                  <span>{item.availableUnits} units</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Reserved</span>
                  <span>{item.reservedUnits} units</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span>Total</span>
                  <span>{item.totalUnits} units</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Blood Units</CardTitle>
          <CardDescription>Detailed view of all blood units in the inventory</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by blood group, donor ID or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="reserved">Reserved</option>
                <option value="used">Used</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Blood Group</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Collection Date</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Donor ID</TableHead>
                  {role === 'admin' && <TableHead>Location</TableHead>}
                  {role === 'admin' && <TableHead className="text-right">Actions</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUnits.length > 0 ? (
                  filteredUnits.map((unit) => {
                    const daysLeft = daysUntilExpiry(unit.expiresAt);
                    return (
                      <TableRow key={unit.id}>
                        <TableCell>
                          <BloodUnitBadge bloodGroup={unit.bloodGroup} />
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={unit.status} />
                        </TableCell>
                        <TableCell>{formatDate(unit.collectedAt)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {formatDate(unit.expiresAt)}
                            {daysLeft <= 7 && daysLeft > 0 && unit.status === 'available' && (
                              <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-800">
                                {daysLeft} days left
                              </span>
                            )}
                            {daysLeft <= 0 && unit.status === 'available' && (
                              <span className="px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-800">
                                Expired
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{unit.donorId}</TableCell>
                        {role === 'admin' && <TableCell>{unit.location || 'N/A'}</TableCell>}
                        {role === 'admin' && (
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm">
                              Update
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={role === 'admin' ? 7 : 5} className="text-center py-8 text-muted-foreground">
                      No blood units found matching your filters.
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

export default BloodInventory;

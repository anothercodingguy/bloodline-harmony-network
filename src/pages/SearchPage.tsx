
import React, { useState, useCallback } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BloodUnitBadge } from '@/components/BloodUnitBadge';
import { searchDonors, searchDonorsByBloodGroup } from '@/services/userService';
import { getBloodUnitsByGroup } from '@/services/bloodService';
import { Donor, BloodUnit } from '@/models/types';
import debounce from 'lodash/debounce';
import { Loader2, Search, MapPin, Phone, User, Calendar, AlertCircle } from 'lucide-react';

const SearchPage = () => {
  const [activeTab, setActiveTab] = useState('donors');
  const [searchQuery, setSearchQuery] = useState('');
  const [bloodGroupQuery, setBloodGroupQuery] = useState('');
  const [donors, setDonors] = useState<Donor[]>([]);
  const [bloodUnits, setBloodUnits] = useState<BloodUnit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setSearchPerformed(true);
    
    try {
      if (activeTab === 'donors') {
        const results = await searchDonors(query);
        setDonors(results);
      } else {
        const results = await getBloodUnitsByGroup(query as any);
        setBloodUnits(results);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBloodGroupSearch = async (bloodGroup: string) => {
    if (!bloodGroup.trim()) return;
    
    setIsLoading(true);
    setSearchPerformed(true);
    
    try {
      if (activeTab === 'donors') {
        const results = await searchDonorsByBloodGroup(bloodGroup);
        setDonors(results);
      } else {
        const results = await getBloodUnitsByGroup(bloodGroup as any);
        setBloodUnits(results);
      }
    } catch (error) {
      console.error('Blood group search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search functions
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      handleSearch(query);
    }, 500),
    [activeTab]
  );

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setDonors([]);
    setBloodUnits([]);
    setSearchQuery('');
    setBloodGroupQuery('');
    setSearchPerformed(false);
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  const isEligibleToDonate = (lastDonation: Date | undefined) => {
    if (!lastDonation) return true;
    
    const now = new Date();
    const lastDonationDate = new Date(lastDonation);
    const diffTime = now.getTime() - lastDonationDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    
    // Most guidelines suggest 56-90 days between donations
    return diffDays >= 56;
  };

  return (
    <DashboardLayout title="Search">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Search Database</CardTitle>
          <CardDescription>
            Search for donors or available blood units by various criteria
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="space-y-6"
          >
            <TabsList>
              <TabsTrigger value="donors">Search Donors</TabsTrigger>
              <TabsTrigger value="blood">Search Blood Units</TabsTrigger>
            </TabsList>

            <TabsContent value="donors">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search by Name or Address</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Enter name or address..."
                        value={searchQuery}
                        onChange={(e) => {
                          setSearchQuery(e.target.value);
                          debouncedSearch(e.target.value);
                        }}
                        className="pl-9"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search by Blood Group</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter blood group (e.g., A+, O-, AB+)"
                      value={bloodGroupQuery}
                      onChange={(e) => setBloodGroupQuery(e.target.value)}
                    />
                    <Button 
                      onClick={() => handleBloodGroupSearch(bloodGroupQuery)}
                      disabled={isLoading || !bloodGroupQuery.trim()}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Search'
                      )}
                    </Button>
                  </div>
                </div>

                <div className="mt-6">
                  {isLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : searchPerformed ? (
                    donors.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {donors.map(donor => (
                          <div
                            key={donor.id}
                            className="border rounded-md p-4 hover:border-primary transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <h3 className="font-medium">{donor.name}</h3>
                                <div className="text-sm text-muted-foreground flex items-center mt-1">
                                  <User className="h-3 w-3 mr-1" /> 
                                  {donor.age} years
                                </div>
                              </div>
                              <BloodUnitBadge bloodGroup={donor.bloodGroup} />
                            </div>
                            
                            <div className="mt-3 space-y-2 text-sm">
                              {donor.phone && (
                                <div className="flex items-center">
                                  <Phone className="h-3 w-3 mr-2 text-muted-foreground" />
                                  {donor.phone}
                                </div>
                              )}
                              
                              {donor.address && (
                                <div className="flex items-start">
                                  <MapPin className="h-3 w-3 mr-2 mt-0.5 text-muted-foreground" />
                                  <span>{donor.address}</span>
                                </div>
                              )}
                              
                              <div className="flex items-center">
                                <Calendar className="h-3 w-3 mr-2 text-muted-foreground" />
                                Last donation: {formatDate(donor.lastDonation)}
                              </div>
                              
                              <div className="flex items-center pt-1">
                                {donor.isEligible && isEligibleToDonate(donor.lastDonation) ? (
                                  <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                                    Eligible to donate
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs rounded-full flex items-center">
                                    <AlertCircle className="h-3 w-3 mr-1" />
                                    Not eligible yet
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No donors found matching your search criteria.
                      </div>
                    )
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Enter a search term to find donors.
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="blood">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search by Blood Group</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Enter blood group (e.g., A+, O-, AB+)"
                      value={bloodGroupQuery}
                      onChange={(e) => setBloodGroupQuery(e.target.value)}
                    />
                    <Button 
                      onClick={() => handleBloodGroupSearch(bloodGroupQuery)}
                      disabled={isLoading || !bloodGroupQuery.trim()}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        'Search'
                      )}
                    </Button>
                  </div>
                </div>

                <div className="mt-6">
                  {isLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : searchPerformed ? (
                    bloodUnits.length > 0 ? (
                      <div>
                        <div className="mb-4">
                          <strong>{bloodUnits.filter(unit => unit.status === 'available').length}</strong> available units of{' '}
                          <BloodUnitBadge bloodGroup={bloodUnits[0].bloodGroup} /> blood found.
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {bloodUnits
                            .filter(unit => unit.status === 'available')
                            .map(unit => {
                              const collectionDate = new Date(unit.collectedAt);
                              const expiryDate = new Date(unit.expiresAt);
                              const today = new Date();
                              const daysLeft = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                              
                              return (
                                <Card key={unit.id} className="overflow-hidden">
                                  <div className={`h-2 ${daysLeft < 7 ? 'bg-amber-500' : 'bg-green-500'}`}></div>
                                  <CardContent className="pt-4">
                                    <div className="flex justify-between items-start">
                                      <BloodUnitBadge bloodGroup={unit.bloodGroup} size="lg" />
                                      <div className="text-right">
                                        <div className="text-sm font-medium">
                                          {daysLeft} days left
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          Expires: {expiryDate.toLocaleDateString()}
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div className="mt-3 space-y-1 text-sm">
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Collected:</span>
                                        <span>{collectionDate.toLocaleDateString()}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Location:</span>
                                        <span>{unit.location || 'Central Blood Bank'}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Unit ID:</span>
                                        <span className="font-mono text-xs">{unit.id}</span>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            })}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No blood units found matching your search criteria.
                      </div>
                    )
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Enter a blood group to find available units.
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default SearchPage;

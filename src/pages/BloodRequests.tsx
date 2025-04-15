
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { BloodGroupSelector } from '@/components/BloodGroupSelector';
import { BloodUnitBadge } from '@/components/BloodUnitBadge';
import { StatusBadge } from '@/components/StatusBadge';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getAllBloodRequests, createBloodRequest, updateBloodRequestStatus } from '@/services/bloodService';
import { BloodRequest } from '@/models/types';
import { Loader2, Filter, Search } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const requestSchema = z.object({
  patientName: z.string().min(2, { message: 'Patient name is required' }),
  bloodGroup: z.string().min(1, { message: 'Blood group is required' }),
  quantity: z.coerce.number().min(1, { message: 'At least 1 unit is required' }),
  hospital: z.string().min(2, { message: 'Hospital name is required' }),
  requiredDate: z.string().min(1, { message: 'Required date is required' }),
  reason: z.string().min(5, { message: 'Reason is required' }),
  urgency: z.enum(['normal', 'urgent', 'emergency'], {
    required_error: 'Urgency level is required',
  }),
});

type RequestFormValues = z.infer<typeof requestSchema>;

const BloodRequests = () => {
  const { toast } = useToast();
  const { user, role } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<BloodRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<string>('view');

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      patientName: '',
      bloodGroup: '',
      quantity: 1,
      hospital: '',
      requiredDate: '',
      reason: '',
      urgency: 'normal',
    },
  });

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await getAllBloodRequests();
        
        // Filter requests based on user role
        let filteredData = data;
        if (role === 'requester' && user) {
          filteredData = data.filter(req => req.requesterId === user.id);
        }
        
        setRequests(filteredData);
        setFilteredRequests(filteredData);
      } catch (error) {
        console.error('Error fetching blood requests:', error);
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
  }, [searchQuery, statusFilter, requests]);

  const onSubmit = async (data: RequestFormValues) => {
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      const requiredDate = new Date(data.requiredDate);
      if (requiredDate < new Date()) {
        toast({
          title: 'Invalid Date',
          description: 'Required date cannot be in the past',
          variant: 'destructive',
        });
        setIsSubmitting(false);
        return;
      }

      await createBloodRequest({
        requesterId: user.id,
        requesterName: user.name,
        patientName: data.patientName,
        bloodGroup: data.bloodGroup as any,
        quantity: data.quantity,
        requestDate: new Date(),
        requiredDate,
        hospital: data.hospital,
        reason: data.reason,
        status: 'pending',
        urgency: data.urgency,
      });

      toast({
        title: 'Request Submitted',
        description: 'Your blood request has been submitted successfully',
      });

      form.reset({
        patientName: '',
        bloodGroup: '',
        quantity: 1,
        hospital: '',
        requiredDate: '',
        reason: '',
        urgency: 'normal',
      });
      
      setActiveTab('view');
      
      // Refresh the requests list
      const updatedRequests = await getAllBloodRequests();
      const filtered = role === 'requester' && user 
        ? updatedRequests.filter(req => req.requesterId === user.id)
        : updatedRequests;
      
      setRequests(filtered);
      setFilteredRequests(filtered);
    } catch (error) {
      toast({
        title: 'Failed to Submit Request',
        description: 'There was an error processing your request. Please try again.',
        variant: 'destructive',
      });
      console.error('Request submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelRequest = async (requestId: string) => {
    try {
      await updateBloodRequestStatus(
        requestId, 
        'rejected', 
        'Cancelled by requester'
      );
      
      toast({
        title: 'Request Cancelled',
        description: 'Your blood request has been cancelled',
      });
      
      // Refresh the requests list
      const updatedRequests = await getAllBloodRequests();
      const filtered = role === 'requester' && user 
        ? updatedRequests.filter(req => req.requesterId === user.id)
        : updatedRequests;
      
      setRequests(filtered);
      setFilteredRequests(filtered);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel request',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <DashboardLayout title="Blood Requests">
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="space-y-6"
      >
        <TabsList>
          <TabsTrigger value="view">View Requests</TabsTrigger>
          <TabsTrigger value="create">Create New Request</TabsTrigger>
        </TabsList>

        <TabsContent value="view" className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Blood Requests</CardTitle>
              <CardDescription>
                {role === 'requester'
                  ? 'View and manage your blood requests'
                  : role === 'admin'
                  ? 'Manage all blood requests from patients and hospitals'
                  : 'View current blood requests'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by patient name, blood group, or hospital..."
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
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="fulfilled">Fulfilled</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Patient</TableHead>
                      <TableHead>Blood Group</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Hospital</TableHead>
                      <TableHead>Required Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Urgency</TableHead>
                      {role === 'requester' && <TableHead className="text-right">Action</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.length > 0 ? (
                      filteredRequests.map((request) => (
                        <TableRow key={request.id}>
                          <TableCell>{request.patientName}</TableCell>
                          <TableCell>
                            <BloodUnitBadge bloodGroup={request.bloodGroup} />
                          </TableCell>
                          <TableCell>{request.quantity} unit(s)</TableCell>
                          <TableCell>{request.hospital}</TableCell>
                          <TableCell>{formatDate(request.requiredDate)}</TableCell>
                          <TableCell>
                            <StatusBadge status={request.status} />
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={request.urgency} />
                          </TableCell>
                          {role === 'requester' && (
                            <TableCell className="text-right">
                              {request.status === 'pending' && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleCancelRequest(request.id)}
                                >
                                  Cancel
                                </Button>
                              )}
                            </TableCell>
                          )}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={role === 'requester' ? 8 : 7} className="text-center py-8 text-muted-foreground">
                          No blood requests found matching your filters.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Request Blood</CardTitle>
                <CardDescription>
                  Fill out this form to request blood for a patient
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="patientName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Patient Name<span className="text-destructive ml-1">*</span></FormLabel>
                            <FormControl>
                              <Input placeholder="Enter patient name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="hospital"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Hospital/Medical Facility<span className="text-destructive ml-1">*</span></FormLabel>
                            <FormControl>
                              <Input placeholder="Enter hospital name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <BloodGroupSelector control={form.control} name="bloodGroup" />

                      <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity (Units)<span className="text-destructive ml-1">*</span></FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="requiredDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Required By<span className="text-destructive ml-1">*</span></FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="reason"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reason for Request<span className="text-destructive ml-1">*</span></FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter medical reason for the blood request"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="urgency"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Urgency Level<span className="text-destructive ml-1">*</span></FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="normal" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Normal (Within a week)
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="urgent" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Urgent (Within 48 hours)
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="emergency" />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  Emergency (Immediate requirement)
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        'Submit Blood Request'
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  );
};

export default BloodRequests;

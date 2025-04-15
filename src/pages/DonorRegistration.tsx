
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BloodGroupSelector } from '@/components/BloodGroupSelector';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { createDonor } from '@/services/userService';
import { createDonation } from '@/services/bloodService';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2Icon } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  age: z.coerce.number().min(18, { message: 'Must be at least 18 years old.' }).max(65, { message: 'Must be under 65 years old.' }),
  weight: z.coerce.number().min(45, { message: 'Weight must be at least 45 kg.' }),
  bloodGroup: z.string().min(1, { message: 'Blood group is required.' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number.' }),
  address: z.string().min(5, { message: 'Address is required.' }),
  medicalHistory: z.string().optional(),
  lastDonation: z.string().optional(),
  agreement: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to donate blood.' }),
  }),
  healthDeclaration: z.literal(true, {
    errorMap: () => ({ message: 'You must confirm you are in good health.' }),
  }),
});

type FormValues = z.infer<typeof formSchema>;

const DonorRegistration = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name || '',
      age: 0,
      weight: 0,
      bloodGroup: '',
      phone: '',
      address: '',
      medicalHistory: '',
      lastDonation: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      // Create donor record
      const donor = await createDonor({
        name: data.name,
        email: user?.email || '',
        bloodGroup: data.bloodGroup as any,
        age: data.age,
        weight: data.weight,
        phone: data.phone,
        address: data.address,
        medicalHistory: data.medicalHistory,
        lastDonation: data.lastDonation ? new Date(data.lastDonation) : undefined,
        isEligible: true,
      });

      // Create donation record
      await createDonation({
        donorId: donor.id,
        donorName: donor.name,
        bloodGroup: donor.bloodGroup,
        quantity: 1, // Default to 1 unit
        donationDate: new Date(),
        location: 'Central Blood Bank',
        status: 'pending',
      });

      toast({
        title: 'Registration Successful',
        description: 'Your donor registration has been completed. Thank you for donating blood!',
      });

      // Reset the form
      form.reset({
        name: '',
        age: 0,
        weight: 0,
        bloodGroup: '',
        phone: '',
        address: '',
        medicalHistory: '',
        lastDonation: '',
      });
    } catch (error) {
      toast({
        title: 'Registration Failed',
        description: 'There was an error processing your registration. Please try again.',
        variant: 'destructive',
      });
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Donor Registration">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Register as Blood Donor</CardTitle>
            <CardDescription>
              Fill in the form below to register as a blood donor. Your contribution can save lives.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name<span className="text-destructive ml-1">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number<span className="text-destructive ml-1">*</span></FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your phone number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age<span className="text-destructive ml-1">*</span></FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter your age"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>Must be between 18-65 years</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (kg)<span className="text-destructive ml-1">*</span></FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter your weight in kg"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>Must be at least 45kg</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <BloodGroupSelector control={form.control} name="bloodGroup" />
                </div>

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address<span className="text-destructive ml-1">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your full address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastDonation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Donation Date (if any)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>Leave blank if you haven't donated before</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="medicalHistory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medical History (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter any relevant medical conditions or history"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Include any conditions or medications that might affect your eligibility
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="healthDeclaration"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I declare that I am in good health and have no known conditions that may make blood donation unsafe for me or for recipients
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="agreement"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            I agree to donate my blood voluntarily and understand that it will be tested for infectious diseases
                          </FormLabel>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? (
                    <>
                      <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Register as Donor'
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DonorRegistration;

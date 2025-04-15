
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { DropletIcon, HeartPulseIcon, SearchIcon, UserPlusIcon, ClipboardCheckIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <DropletIcon className="h-8 w-8 text-blood-500" />
            <span className="ml-2 text-xl font-bold text-gray-900">BloodBank</span>
          </div>
          <div className="flex gap-4">
            {isAuthenticated ? (
              <Button asChild>
                <Link to="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Register</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="blood-drop-bg flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 lg:px-8 py-12 sm:py-24">
        <div className="max-w-3xl">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight">
            <span className="block">Donate Blood.</span>
            <span className="block text-blood-600">Save Lives.</span>
          </h1>
          <p className="mt-6 text-xl text-gray-500">
            Join our blood donation network and help save lives. Every donation can save up to three lives.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              {isAuthenticated ? (
                <Link to="/donor-registration">Become a Donor</Link>
              ) : (
                <Link to="/register">Become a Donor</Link>
              )}
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to={isAuthenticated ? "/blood-requests" : "/login"}>Request Blood</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Our blood bank management system makes the donation and request process simple and efficient.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="bg-blood-100 p-3 rounded-full">
                <UserPlusIcon className="h-8 w-8 text-blood-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Register</h3>
              <p className="mt-2 text-base text-gray-500">
                Create an account as a donor or a requester in just a few steps.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-blood-100 p-3 rounded-full">
                <DropletIcon className="h-8 w-8 text-blood-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Donate</h3>
              <p className="mt-2 text-base text-gray-500">
                Schedule your donation and help save lives with your blood.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-blood-100 p-3 rounded-full">
                <SearchIcon className="h-8 w-8 text-blood-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Find</h3>
              <p className="mt-2 text-base text-gray-500">
                Search for available blood by type, location, or donor name.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="bg-blood-100 p-3 rounded-full">
                <ClipboardCheckIcon className="h-8 w-8 text-blood-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Request</h3>
              <p className="mt-2 text-base text-gray-500">
                Request blood when needed for medical procedures or emergencies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Blood Donation Impact
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Every donation makes a difference. See the impact of our blood donation network.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-4xl font-bold text-blood-600">4.5M+</div>
              <div className="mt-2 text-lg text-gray-600">Lives Saved</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-4xl font-bold text-blood-600">1.2M+</div>
              <div className="mt-2 text-lg text-gray-600">Donors Registered</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="text-4xl font-bold text-blood-600">2.8M+</div>
              <div className="mt-2 text-lg text-gray-600">Donations Completed</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="bg-blood-600 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl text-center">
            Ready to make a difference?
          </h2>
          <p className="mt-4 text-lg text-blood-100 max-w-2xl text-center">
            Join our network of donors and help save lives. It only takes a few minutes to register.
          </p>
          <div className="mt-8">
            <Button size="lg" variant="secondary" asChild>
              <Link to={isAuthenticated ? "/donor-registration" : "/register"}>
                Become a Donor Today
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center">
              <HeartPulseIcon className="h-8 w-8 text-blood-500" />
              <span className="ml-2 text-xl font-bold">BloodBank</span>
            </div>
            <div className="mt-4 md:mt-0 text-sm text-gray-400">
              &copy; {new Date().getFullYear()} BloodBank Management System. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;

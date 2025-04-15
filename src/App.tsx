
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import DonorRegistration from "./pages/DonorRegistration";
import BloodInventory from "./pages/BloodInventory";
import BloodRequests from "./pages/BloodRequests";
import DonationHistory from "./pages/DonationHistory";
import RequestHistory from "./pages/RequestHistory";
import SearchPage from "./pages/SearchPage";
import RequireAuth from "./components/RequireAuth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            } />
            <Route path="/admin" element={
              <RequireAuth adminOnly>
                <AdminDashboard />
              </RequireAuth>
            } />
            <Route path="/donor-registration" element={
              <RequireAuth>
                <DonorRegistration />
              </RequireAuth>
            } />
            <Route path="/blood-inventory" element={
              <RequireAuth>
                <BloodInventory />
              </RequireAuth>
            } />
            <Route path="/blood-requests" element={
              <RequireAuth>
                <BloodRequests />
              </RequireAuth>
            } />
            <Route path="/donation-history" element={
              <RequireAuth>
                <DonationHistory />
              </RequireAuth>
            } />
            <Route path="/request-history" element={
              <RequireAuth>
                <RequestHistory />
              </RequireAuth>
            } />
            <Route path="/search" element={
              <RequireAuth>
                <SearchPage />
              </RequireAuth>
            } />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

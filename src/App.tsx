
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import Pricing from "./pages/Pricing";
import Dashboard from "./pages/Dashboard";
import AdminPods from "./pages/admin/Pods";
import AdminUsers from "./pages/admin/Users";
import AdminSettings from "./pages/admin/Settings";
import AdminHelp from "./pages/admin/Help";
import AdminPodDeploy from "./pages/admin/PodDeploy";
import ClientStats from "./pages/client/Stats";
import ClientPods from "./pages/client/Pods";
import ClientSettings from "./pages/client/Settings";
import ClientHelp from "./pages/client/Help";
import ClientPodDeploy from "./pages/client/PodDeploy";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            
            {/* Admin Routes */}
            <Route path="/admin/pods" element={<ProtectedRoute requiredRole="admin"><AdminPods /></ProtectedRoute>} />
            <Route path="/admin/pods/deploy" element={<ProtectedRoute requiredRole="admin"><AdminPodDeploy /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute requiredRole="admin"><AdminSettings /></ProtectedRoute>} />
            <Route path="/admin/help" element={<ProtectedRoute requiredRole="admin"><AdminHelp /></ProtectedRoute>} />
            
            {/* Client Routes */}
            <Route path="/client/stats" element={<ProtectedRoute requiredRole="client"><ClientStats /></ProtectedRoute>} />
            <Route path="/client/pods" element={<ProtectedRoute requiredRole="client"><ClientPods /></ProtectedRoute>} />
            <Route path="/client/pods/deploy" element={<ProtectedRoute requiredRole="client"><ClientPodDeploy /></ProtectedRoute>} />
            <Route path="/client/settings" element={<ProtectedRoute requiredRole="client"><ClientSettings /></ProtectedRoute>} />
            <Route path="/client/help" element={<ProtectedRoute requiredRole="client"><ClientHelp /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

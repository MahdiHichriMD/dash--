import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Login from "@/pages/login";
import ReceivedChargebacks from "@/pages/received-chargebacks";
import IssuedRepresentments from "@/pages/issued-representments";
import IssuedChargebacks from "@/pages/issued-chargebacks";
import ReceivedRepresentments from "@/pages/received-representments";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-banking-indicator mx-auto mb-4"></div>
          <p className="text-banking-text/60">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-banking-indicator mx-auto mb-4"></div>
          <p className="text-banking-text/60">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Dashboard />
        </main>
      </div>
    );
  }

  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/login">
        <PublicRoute>
          <Login />
        </PublicRoute>
      </Route>
      
      <Route path="/">
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      </Route>
      
      <Route path="/received-chargebacks">
        <ProtectedRoute>
          <ReceivedChargebacks />
        </ProtectedRoute>
      </Route>
      
      <Route path="/issued-representments">
        <ProtectedRoute>
          <IssuedRepresentments />
        </ProtectedRoute>
      </Route>
      
      <Route path="/issued-chargebacks">
        <ProtectedRoute>
          <IssuedChargebacks />
        </ProtectedRoute>
      </Route>
      
      <Route path="/received-representments">
        <ProtectedRoute>
          <ReceivedRepresentments />
        </ProtectedRoute>
      </Route>

      {/* Fallback to 404 */}
      <Route>
        <ProtectedRoute>
          <NotFound />
        </ProtectedRoute>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

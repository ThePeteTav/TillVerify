import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/not-found";
import AdminPanel from "@/components/AdminPanel";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/admin" component={() => (
            <div className="min-h-screen bg-background">
              <header className="border-b bg-card">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                  <h1 className="text-2xl font-bold">Admin Panel</h1>
                  <button 
                    onClick={() => window.location.href = '/'}
                    className="text-primary hover:underline"
                  >
                    Back to Dashboard
                  </button>
                </div>
              </header>
              <main className="container mx-auto px-4 py-8">
                <AdminPanel />
              </main>
            </div>
          )} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calculator, User, LogOut, Settings, BarChart3 } from "lucide-react";
import SalesEntryForm, { type SalesData } from "@/components/SalesEntryForm";
import DenominationInput, { type DenominationCounts } from "@/components/DenominationInput";
import CheckEntry, { type CheckData } from "@/components/CheckEntry";
import ReconciliationResults from "@/components/ReconciliationResults";
import SettingsDialog from "@/components/SettingsDialog";

type Step = 'sales' | 'counting' | 'results';

export default function Dashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<Step>('sales');
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [denominationCounts, setDenominationCounts] = useState<DenominationCounts | null>(null);
  const [cashCount, setCashCount] = useState(0);
  const [checkData, setCheckData] = useState<CheckData | null>(null);
  const [totalChecks, setTotalChecks] = useState(0);
  const [reconciliationId, setReconciliationId] = useState<number | null>(null);

  const { data: settings } = useQuery<{ startingCash: string; tolerance: string; requireManagerApproval: boolean }>({
    queryKey: ['/api/settings'],
  });

  const createReconciliationMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest('POST', '/api/reconciliations', data);
      return await res.json();
    },
    onSuccess: (data: any) => {
      setReconciliationId(data.id);
      setCurrentStep('results');
      toast({
        title: "Success",
        description: "Reconciliation completed successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  const handleSalesSubmit = () => {
    if (!salesData) return;
    setCurrentStep('counting');
  };

  const handleCashCountSubmit = () => {
    if (!denominationCounts || !salesData || !checkData) return;
    
    if (Math.abs(salesData.checkSales - totalChecks) > 0.01) {
      toast({
        title: "Check Mismatch",
        description: `Check sales ($${salesData.checkSales.toFixed(2)}) does not match total checks entered ($${totalChecks.toFixed(2)}). Please verify.`,
        variant: "destructive",
      });
      return;
    }
    
    createReconciliationMutation.mutate({
      cashSales: salesData.cashSales,
      checkSales: totalChecks,
      cashOut: salesData.cashOut,
      startingCash: salesData.startingCash,
      check1Date: checkData.check1Date || null,
      check1Number: checkData.check1Number || null,
      check1Name: checkData.check1Name || null,
      check1Amount: checkData.check1Amount || 0,
      check2Date: checkData.check2Date || null,
      check2Number: checkData.check2Number || null,
      check2Name: checkData.check2Name || null,
      check2Amount: checkData.check2Amount || 0,
      check3Date: checkData.check3Date || null,
      check3Number: checkData.check3Number || null,
      check3Name: checkData.check3Name || null,
      check3Amount: checkData.check3Amount || 0,
      hundreds: denominationCounts.hundreds,
      fifties: denominationCounts.fifties,
      twenties: denominationCounts.twenties,
      tens: denominationCounts.tens,
      fives: denominationCounts.fives,
      ones: denominationCounts.ones,
      quarters: denominationCounts.quarters,
      dimes: denominationCounts.dimes,
      nickels: denominationCounts.nickels,
      pennies: denominationCounts.pennies,
      cashCount: cashCount,
      notes: salesData.notes,
    });
  };

  const handleGeneratePDF = () => {
    if (reconciliationId) {
      window.open(`/api/reconciliations/${reconciliationId}/pdf`, '_blank');
    }
  };

  const handleExportExcel = () => {
    window.open('/api/reconciliations/export/excel', '_blank');
  };

  const resetReconciliation = () => {
    setCurrentStep('sales');
    setSalesData(null);
    setDenominationCounts(null);
    setCashCount(0);
    setCheckData(null);
    setTotalChecks(0);
    setReconciliationId(null);
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'sales': return 'Step 1: Enter Sales Data';
      case 'counting': return 'Step 2: Count Cash Drawer';
      case 'results': return 'Step 3: Reconciliation Results';
    }
  };

  const getUserInitials = () => {
    if (!user) return 'U';
    const firstName = (user as any).firstName || '';
    const lastName = (user as any).lastName || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || (user as any).email?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Calculator className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Cash Reconciliation</h1>
              <p className="text-sm text-muted-foreground">{getStepTitle()}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* todo: remove mock functionality - user profile */}
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={(user as any)?.profileImageUrl} />
                <AvatarFallback>{getUserInitials()}</AvatarFallback>
              </Avatar>
              <div className="text-right">
                <p className="text-sm font-medium">
                  {(user as any)?.firstName || (user as any)?.email || 'Employee'}
                </p>
                <p className="text-xs text-muted-foreground">Cashier</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <SettingsDialog />
              <Button variant="outline" onClick={handleLogout} data-testid="button-logout">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="border-b bg-muted/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center space-x-8">
            <div className={`flex items-center gap-2 ${
              currentStep === 'sales' ? 'text-primary' : 
              ['counting', 'results'].includes(currentStep) ? 'text-chart-2' : 'text-muted-foreground'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 'sales' ? 'bg-primary text-primary-foreground' :
                ['counting', 'results'].includes(currentStep) ? 'bg-chart-2 text-white' : 'bg-muted'
              }`}>
                1
              </div>
              <span className="font-medium">Sales Data</span>
            </div>
            
            <div className={`h-0.5 w-16 ${
              ['counting', 'results'].includes(currentStep) ? 'bg-chart-2' : 'bg-muted'
            }`} />
            
            <div className={`flex items-center gap-2 ${
              currentStep === 'counting' ? 'text-primary' : 
              currentStep === 'results' ? 'text-chart-2' : 'text-muted-foreground'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 'counting' ? 'bg-primary text-primary-foreground' :
                currentStep === 'results' ? 'bg-chart-2 text-white' : 'bg-muted'
              }`}>
                2
              </div>
              <span className="font-medium">Cash Count</span>
            </div>
            
            <div className={`h-0.5 w-16 ${
              currentStep === 'results' ? 'bg-chart-2' : 'bg-muted'
            }`} />
            
            <div className={`flex items-center gap-2 ${
              currentStep === 'results' ? 'text-primary' : 'text-muted-foreground'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                currentStep === 'results' ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}>
                3
              </div>
              <span className="font-medium">Results</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {currentStep === 'sales' && (
          <div className="max-w-4xl mx-auto">
            <SalesEntryForm
              onSalesDataChange={setSalesData}
              onSubmit={handleSalesSubmit}
              isLoading={false}
              startingCash={settings?.startingCash ? parseFloat(settings.startingCash) : 0}
            />
          </div>
        )}

        {currentStep === 'counting' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <DenominationInput
              onCountsChange={(counts, total) => {
                setDenominationCounts(counts);
                setCashCount(total);
              }}
              onSubmit={handleCashCountSubmit}
              isLoading={createReconciliationMutation.isPending}
            />
            
            <CheckEntry
              onCheckDataChange={(data, total) => {
                setCheckData(data);
                setTotalChecks(total);
              }}
            />
            
            {salesData && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Reference: Expected Cash</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-muted-foreground">
                    ${(salesData.startingCash + salesData.cashSales - salesData.cashOut).toFixed(2)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Starting Cash + Cash Sales - Cash Out
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {currentStep === 'results' && salesData && denominationCounts && checkData && (
          <div className="max-w-4xl mx-auto">
            <ReconciliationResults
              salesData={salesData}
              cashCount={cashCount}
              totalChecks={totalChecks}
              denominationCounts={denominationCounts}
              onGeneratePDF={handleGeneratePDF}
              onExportExcel={handleExportExcel}
              isGeneratingReport={false}
            />
            
            <div className="flex justify-center mt-8">
              <Button 
                onClick={resetReconciliation} 
                variant="outline" 
                size="lg"
                data-testid="button-new-reconciliation"
              >
                Start New Reconciliation
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
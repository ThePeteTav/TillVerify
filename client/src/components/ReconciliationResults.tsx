import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Download, FileText, AlertTriangle, Send } from "lucide-react";
import { type SalesData } from "./SalesEntryForm";
import { type DenominationCounts } from "./DenominationInput";

interface ReconciliationResultsProps {
  salesData: SalesData;
  cashCount: number;
  totalChecks: number;
  denominationCounts: DenominationCounts;
  reconciliationId?: number;
  isSubmitted?: boolean;
  onGeneratePDF: () => void;
  onExportExcel: () => void;
  onFinalSubmit?: () => void;
  isGeneratingReport?: boolean;
  isSubmitting?: boolean;
}

export default function ReconciliationResults({ 
  salesData, 
  cashCount, 
  totalChecks,
  denominationCounts,
  reconciliationId,
  isSubmitted = false,
  onGeneratePDF,
  onExportExcel,
  onFinalSubmit,
  isGeneratingReport,
  isSubmitting = false
}: ReconciliationResultsProps) {
  const cashForDeposit = cashCount - salesData.startingCash;
  const expectedDeposit = salesData.cashSales + salesData.checkSales - salesData.cashOut;
  const actualDeposit = cashForDeposit + totalChecks;
  const difference = actualDeposit - expectedDeposit;
  const isMatching = Math.abs(difference) < 0.01; // Account for floating point precision
  const tolerance = 5.00; // $5 tolerance - ideally from settings
  const isWithinTolerance = Math.abs(difference) <= tolerance;

  const getStatusIcon = () => {
    if (isMatching) return <CheckCircle className="h-5 w-5 text-chart-2" />;
    if (isWithinTolerance) return <AlertTriangle className="h-5 w-5 text-chart-3" />;
    return <XCircle className="h-5 w-5 text-destructive" />;
  };

  const getStatusBadge = () => {
    if (isMatching) return <Badge variant="secondary" className="bg-chart-2/10 text-chart-2">Perfect Match</Badge>;
    if (isWithinTolerance) return <Badge variant="secondary" className="bg-chart-3/10 text-chart-3">Within Tolerance</Badge>;
    return <Badge variant="destructive">Discrepancy</Badge>;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon()}
            Reconciliation Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-lg">Status:</span>
            {getStatusBadge()}
          </div>
          
          {!isMatching && (
            <Alert variant={isWithinTolerance ? "default" : "destructive"}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {isWithinTolerance 
                  ? `Discrepancy of $${Math.abs(difference).toFixed(2)} is within acceptable tolerance of $${tolerance.toFixed(2)}.`
                  : `Significant discrepancy of $${Math.abs(difference).toFixed(2)} detected. Please review cash count and sales data.`
                }
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Expected Deposit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Cash Sales:</span>
                <span data-testid="text-cash-sales">+${salesData.cashSales.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Check Sales:</span>
                <span data-testid="text-check-sales">+${salesData.checkSales.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Cash Out:</span>
                <span data-testid="text-cash-out">-${salesData.cashOut.toFixed(2)}</span>
              </div>
              <hr />
              <div className="flex justify-between font-semibold text-lg">
                <span>Expected Total:</span>
                <span data-testid="text-expected-total">${expectedDeposit.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Actual Deposit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Cash for Deposit:</span>
                <span data-testid="text-actual-cash">${cashForDeposit.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Checks:</span>
                <span data-testid="text-actual-checks">${totalChecks.toFixed(2)}</span>
              </div>
              <hr />
              <div className="text-2xl font-bold text-primary" data-testid="text-actual-deposit">
                ${actualDeposit.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">
                Cash + Checks
              </div>
              <hr />
              <div className={`flex justify-between font-semibold text-lg ${
                difference > 0 ? 'text-chart-2' : difference < 0 ? 'text-destructive' : 'text-foreground'
              }`}>
                <span>Difference:</span>
                <span data-testid="text-difference">
                  {difference > 0 ? '+' : ''}${difference.toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-sm text-muted-foreground">Total Cash</div>
              <div className="text-lg font-semibold" data-testid="text-summary-total-cash">${cashForDeposit.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Checks</div>
              <div className="text-lg font-semibold" data-testid="text-summary-total-checks">${totalChecks.toFixed(2)}</div>
            </div>
            <div className="border-l pl-4">
              <div className="text-sm text-muted-foreground">Total Deposit</div>
              <div className="text-2xl font-bold text-primary" data-testid="text-summary-total-deposit">${actualDeposit.toFixed(2)}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button 
          onClick={onGeneratePDF} 
          className="flex-1" 
          size="lg"
          disabled={isGeneratingReport}
          data-testid="button-generate-pdf"
        >
          <FileText className="h-4 w-4 mr-2" />
          {isGeneratingReport ? "Generating..." : "Generate PDF Report"}
        </Button>
        <Button 
          onClick={onExportExcel}
          variant="outline" 
          className="flex-1" 
          size="lg"
          disabled={isGeneratingReport}
          data-testid="button-export-excel"
        >
          <Download className="h-4 w-4 mr-2" />
          Export to Excel
        </Button>
      </div>
      
      {onFinalSubmit && reconciliationId && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Final Submission</h3>
                <p className="text-sm text-muted-foreground">
                  {isSubmitted 
                    ? "This reconciliation has been submitted to Google Sheets and cannot be edited." 
                    : "Click below to submit this reconciliation to Google Sheets. Once submitted, it cannot be edited."}
                </p>
              </div>
              <Button
                onClick={onFinalSubmit}
                size="lg"
                className="w-full"
                disabled={isSubmitted || isSubmitting}
                variant={isSubmitted ? "secondary" : "default"}
                data-testid="button-final-submit"
              >
                {isSubmitted ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Submitted to Google Sheets
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    {isSubmitting ? "Submitting..." : "Submit to Google Sheets"}
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {salesData.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{salesData.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, Download, FileText, AlertTriangle } from "lucide-react";
import { type SalesData } from "./SalesEntryForm";
import { type DenominationCounts } from "./DenominationInput";

interface ReconciliationResultsProps {
  salesData: SalesData;
  cashCount: number;
  denominationCounts: DenominationCounts;
  onGeneratePDF: () => void;
  onExportExcel: () => void;
  isGeneratingReport?: boolean;
}

export default function ReconciliationResults({ 
  salesData, 
  cashCount, 
  denominationCounts,
  onGeneratePDF,
  onExportExcel,
  isGeneratingReport
}: ReconciliationResultsProps) {
  const expectedCash = salesData.startingCash + salesData.cashSales - salesData.cashOut;
  const difference = cashCount - expectedCash;
  const isMatching = Math.abs(difference) < 0.01; // Account for floating point precision
  const tolerance = 5.00; // $5 tolerance
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
            <CardTitle className="text-lg">Expected Cash</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Starting Cash:</span>
                <span data-testid="text-starting-cash">${salesData.startingCash.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Cash Sales:</span>
                <span data-testid="text-cash-sales">+${salesData.cashSales.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Cash Out:</span>
                <span data-testid="text-cash-out">-${salesData.cashOut.toFixed(2)}</span>
              </div>
              <hr />
              <div className="flex justify-between font-semibold text-lg">
                <span>Expected Total:</span>
                <span data-testid="text-expected-total">${expectedCash.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Actual Cash Count</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-primary" data-testid="text-actual-cash">
                ${cashCount.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">
                Counted from denominations
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-sm text-muted-foreground">Total Sales</div>
              <div className="text-lg font-semibold">${salesData.totalSales.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Cash Sales</div>
              <div className="text-lg font-semibold">${salesData.cashSales.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Card Sales</div>
              <div className="text-lg font-semibold">${salesData.cardSales.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Cash Count</div>
              <div className="text-lg font-semibold">${cashCount.toFixed(2)}</div>
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
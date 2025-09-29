import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calculator, FileText, Banknote } from "lucide-react";

export interface SalesData {
  cashSales: number;
  checkSales: number;
  cashOut: number;
  startingCash: number;
  notes: string;
}

interface SalesEntryFormProps {
  onSalesDataChange: (data: SalesData) => void;
  onSubmit: () => void;
  isLoading?: boolean;
  startingCash?: number;
}

export default function SalesEntryForm({ onSalesDataChange, onSubmit, isLoading, startingCash = 0 }: SalesEntryFormProps) {
  const [salesData, setSalesData] = useState<SalesData>({
    cashSales: 0,
    checkSales: 0,
    cashOut: 0,
    startingCash: startingCash,
    notes: '',
  });

  useEffect(() => {
    const newData = { ...salesData, startingCash };
    setSalesData(newData);
    onSalesDataChange(newData);
  }, [startingCash]);

  const handleInputChange = (field: keyof SalesData, value: string | number) => {
    const newData = { ...salesData, [field]: value };
    setSalesData(newData);
    onSalesDataChange(newData);
  };

  const expectedCashInDrawer = salesData.startingCash + salesData.cashSales - salesData.cashOut;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Daily Sales Entry
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startingCash" className="flex items-center gap-2">
                <Banknote className="h-4 w-4" />
                Starting Cash (From Settings)
              </Label>
              <Input
                id="startingCash"
                type="number"
                step="0.01"
                min="0"
                value={salesData.startingCash}
                disabled
                data-testid="input-starting-cash"
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cashSales" className="flex items-center gap-2">
                <Banknote className="h-4 w-4" />
                Cash Sales
              </Label>
              <Input
                id="cashSales"
                type="number"
                step="0.01"
                min="0"
                value={salesData.cashSales}
                onChange={(e) => handleInputChange('cashSales', parseFloat(e.target.value) || 0)}
                data-testid="input-cash-sales"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="checkSales" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Check Sales
              </Label>
              <Input
                id="checkSales"
                type="number"
                step="0.01"
                min="0"
                value={salesData.checkSales}
                onChange={(e) => handleInputChange('checkSales', parseFloat(e.target.value) || 0)}
                data-testid="input-check-sales"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cashOut" className="flex items-center gap-2">
                <Banknote className="h-4 w-4" />
                Cash Out / Withdrawals
              </Label>
              <Input
                id="cashOut"
                type="number"
                step="0.01"
                min="0"
                value={salesData.cashOut}
                onChange={(e) => handleInputChange('cashOut', parseFloat(e.target.value) || 0)}
                data-testid="input-cash-out"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes about today's sales..."
              value={salesData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              data-testid="textarea-notes"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between">
              <span>Expected Cash in Drawer:</span>
              <span className="font-medium" data-testid="text-expected-cash">
                ${expectedCashInDrawer.toFixed(2)}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              Starting Cash + Cash Sales - Cash Out
            </div>
          </div>
          <Button 
            onClick={onSubmit} 
            className="w-full" 
            size="lg"
            disabled={isLoading}
            data-testid="button-submit-sales"
          >
            {isLoading ? "Processing..." : "Submit Sales Data"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}


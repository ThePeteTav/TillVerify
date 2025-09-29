import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calculator, CreditCard, Banknote } from "lucide-react";

interface SalesData {
  totalSales: number;
  cashSales: number;
  cardSales: number;
  cashOut: number;
  startingCash: number;
  notes: string;
}

interface SalesEntryFormProps {
  onSalesDataChange: (data: SalesData) => void;
  onSubmit: () => void;
  isLoading?: boolean;
}

export default function SalesEntryForm({ onSalesDataChange, onSubmit, isLoading }: SalesEntryFormProps) {
  const [salesData, setSalesData] = useState<SalesData>({
    totalSales: 0,
    cashSales: 0,
    cardSales: 0,
    cashOut: 0,
    startingCash: 0,
    notes: '',
  });

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
              <Label htmlFor="totalSales" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Total Sales (POS)
              </Label>
              <Input
                id="totalSales"
                type="number"
                step="0.01"
                min="0"
                value={salesData.totalSales}
                onChange={(e) => handleInputChange('totalSales', parseFloat(e.target.value) || 0)}
                data-testid="input-total-sales"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startingCash" className="flex items-center gap-2">
                <Banknote className="h-4 w-4" />
                Starting Cash
              </Label>
              <Input
                id="startingCash"
                type="number"
                step="0.01"
                min="0"
                value={salesData.startingCash}
                onChange={(e) => handleInputChange('startingCash', parseFloat(e.target.value) || 0)}
                data-testid="input-starting-cash"
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
              <Label htmlFor="cardSales" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Card Sales
              </Label>
              <Input
                id="cardSales"
                type="number"
                step="0.01"
                min="0"
                value={salesData.cardSales}
                onChange={(e) => handleInputChange('cardSales', parseFloat(e.target.value) || 0)}
                data-testid="input-card-sales"
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

export type { SalesData };
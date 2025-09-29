import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText } from "lucide-react";

export interface CheckData {
  check1Date: string;
  check1Number: string;
  check1Name: string;
  check1Amount: number;
  check2Date: string;
  check2Number: string;
  check2Name: string;
  check2Amount: number;
  check3Date: string;
  check3Number: string;
  check3Name: string;
  check3Amount: number;
}

interface CheckEntryProps {
  onCheckDataChange: (data: CheckData, total: number) => void;
}

export default function CheckEntry({ onCheckDataChange }: CheckEntryProps) {
  const [checkData, setCheckData] = useState<CheckData>({
    check1Date: '',
    check1Number: '',
    check1Name: '',
    check1Amount: 0,
    check2Date: '',
    check2Number: '',
    check2Name: '',
    check2Amount: 0,
    check3Date: '',
    check3Number: '',
    check3Name: '',
    check3Amount: 0,
  });

  const handleInputChange = (field: keyof CheckData, value: string | number) => {
    const newData = { ...checkData, [field]: value };
    setCheckData(newData);
    
    const total = newData.check1Amount + newData.check2Amount + newData.check3Amount;
    onCheckDataChange(newData, total);
  };

  const totalChecks = checkData.check1Amount + checkData.check2Amount + checkData.check3Amount;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Check Entry
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Check 1 */}
        <div className="space-y-3 p-4 border rounded-md">
          <h4 className="text-sm font-medium">Check #1</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="check1Date">Check Date</Label>
              <Input
                id="check1Date"
                type="date"
                value={checkData.check1Date}
                onChange={(e) => handleInputChange('check1Date', e.target.value)}
                data-testid="input-check1-date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="check1Number">Check #</Label>
              <Input
                id="check1Number"
                type="text"
                placeholder="Check number"
                value={checkData.check1Number}
                onChange={(e) => handleInputChange('check1Number', e.target.value)}
                data-testid="input-check1-number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="check1Name">Name on Check</Label>
              <Input
                id="check1Name"
                type="text"
                placeholder="Name"
                value={checkData.check1Name}
                onChange={(e) => handleInputChange('check1Name', e.target.value)}
                data-testid="input-check1-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="check1Amount">Amount</Label>
              <Input
                id="check1Amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={checkData.check1Amount || ''}
                onChange={(e) => handleInputChange('check1Amount', parseFloat(e.target.value) || 0)}
                data-testid="input-check1-amount"
              />
            </div>
          </div>
        </div>

        {/* Check 2 */}
        <div className="space-y-3 p-4 border rounded-md">
          <h4 className="text-sm font-medium">Check #2</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="check2Date">Check Date</Label>
              <Input
                id="check2Date"
                type="date"
                value={checkData.check2Date}
                onChange={(e) => handleInputChange('check2Date', e.target.value)}
                data-testid="input-check2-date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="check2Number">Check #</Label>
              <Input
                id="check2Number"
                type="text"
                placeholder="Check number"
                value={checkData.check2Number}
                onChange={(e) => handleInputChange('check2Number', e.target.value)}
                data-testid="input-check2-number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="check2Name">Name on Check</Label>
              <Input
                id="check2Name"
                type="text"
                placeholder="Name"
                value={checkData.check2Name}
                onChange={(e) => handleInputChange('check2Name', e.target.value)}
                data-testid="input-check2-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="check2Amount">Amount</Label>
              <Input
                id="check2Amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={checkData.check2Amount || ''}
                onChange={(e) => handleInputChange('check2Amount', parseFloat(e.target.value) || 0)}
                data-testid="input-check2-amount"
              />
            </div>
          </div>
        </div>

        {/* Check 3 */}
        <div className="space-y-3 p-4 border rounded-md">
          <h4 className="text-sm font-medium">Check #3</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="check3Date">Check Date</Label>
              <Input
                id="check3Date"
                type="date"
                value={checkData.check3Date}
                onChange={(e) => handleInputChange('check3Date', e.target.value)}
                data-testid="input-check3-date"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="check3Number">Check #</Label>
              <Input
                id="check3Number"
                type="text"
                placeholder="Check number"
                value={checkData.check3Number}
                onChange={(e) => handleInputChange('check3Number', e.target.value)}
                data-testid="input-check3-number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="check3Name">Name on Check</Label>
              <Input
                id="check3Name"
                type="text"
                placeholder="Name"
                value={checkData.check3Name}
                onChange={(e) => handleInputChange('check3Name', e.target.value)}
                data-testid="input-check3-name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="check3Amount">Amount</Label>
              <Input
                id="check3Amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={checkData.check3Amount || ''}
                onChange={(e) => handleInputChange('check3Amount', parseFloat(e.target.value) || 0)}
                data-testid="input-check3-amount"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium">Total Checks:</span>
            <span className="text-2xl font-bold" data-testid="text-total-checks">
              ${totalChecks.toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

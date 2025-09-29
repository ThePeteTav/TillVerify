import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FileText, Plus, Trash2 } from "lucide-react";

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

interface Check {
  id: number;
  date: string;
  number: string;
  name: string;
  amount: number;
}

interface CheckEntryProps {
  onCheckDataChange: (data: CheckData, total: number) => void;
}

export default function CheckEntry({ onCheckDataChange }: CheckEntryProps) {
  const [checks, setChecks] = useState<Check[]>([
    { id: 1, date: '', number: '', name: '', amount: 0 }
  ]);

  const updateCheckData = (newChecks: Check[]) => {
    const checkData: CheckData = {
      check1Date: newChecks[0]?.date || '',
      check1Number: newChecks[0]?.number || '',
      check1Name: newChecks[0]?.name || '',
      check1Amount: newChecks[0]?.amount || 0,
      check2Date: newChecks[1]?.date || '',
      check2Number: newChecks[1]?.number || '',
      check2Name: newChecks[1]?.name || '',
      check2Amount: newChecks[1]?.amount || 0,
      check3Date: newChecks[2]?.date || '',
      check3Number: newChecks[2]?.number || '',
      check3Name: newChecks[2]?.name || '',
      check3Amount: newChecks[2]?.amount || 0,
    };
    
    const total = newChecks.reduce((sum, check) => sum + check.amount, 0);
    onCheckDataChange(checkData, total);
  };

  const addCheck = () => {
    if (checks.length < 3) {
      const newChecks = [...checks, { id: checks.length + 1, date: '', number: '', name: '', amount: 0 }];
      setChecks(newChecks);
      updateCheckData(newChecks);
    }
  };

  const removeCheck = (id: number) => {
    if (checks.length > 1) {
      const newChecks = checks.filter(check => check.id !== id);
      setChecks(newChecks);
      updateCheckData(newChecks);
    }
  };

  const handleCheckChange = (id: number, field: keyof Omit<Check, 'id'>, value: string | number) => {
    const newChecks = checks.map(check => 
      check.id === id ? { ...check, [field]: value } : check
    );
    setChecks(newChecks);
    updateCheckData(newChecks);
  };

  const totalChecks = checks.reduce((sum, check) => sum + check.amount, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Check Entry
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {checks.map((check, index) => (
          <div key={check.id} className="space-y-3 p-4 border rounded-md">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Check #{index + 1}</h4>
              {checks.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCheck(check.id)}
                  data-testid={`button-remove-check-${index + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor={`check${check.id}Date`}>Check Date</Label>
                <Input
                  id={`check${check.id}Date`}
                  type="date"
                  value={check.date}
                  onChange={(e) => handleCheckChange(check.id, 'date', e.target.value)}
                  data-testid={`input-check${index + 1}-date`}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`check${check.id}Number`}>Check #</Label>
                <Input
                  id={`check${check.id}Number`}
                  type="text"
                  placeholder="Check number"
                  value={check.number}
                  onChange={(e) => handleCheckChange(check.id, 'number', e.target.value)}
                  data-testid={`input-check${index + 1}-number`}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`check${check.id}Name`}>Name on Check</Label>
                <Input
                  id={`check${check.id}Name`}
                  type="text"
                  placeholder="Name"
                  value={check.name}
                  onChange={(e) => handleCheckChange(check.id, 'name', e.target.value)}
                  data-testid={`input-check${index + 1}-name`}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`check${check.id}Amount`}>Amount</Label>
                <Input
                  id={`check${check.id}Amount`}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={check.amount || ''}
                  onChange={(e) => handleCheckChange(check.id, 'amount', parseFloat(e.target.value) || 0)}
                  data-testid={`input-check${index + 1}-amount`}
                />
              </div>
            </div>
          </div>
        ))}

        {checks.length < 3 && (
          <Button
            variant="outline"
            onClick={addCheck}
            className="w-full"
            data-testid="button-add-check"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Another Check
          </Button>
        )}

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

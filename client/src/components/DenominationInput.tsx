import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DollarSign, Coins } from "lucide-react";

interface DenominationCounts {
  hundreds: number;
  fifties: number;
  twenties: number;
  tens: number;
  fives: number;
  ones: number;
  quarters: number;
  dimes: number;
  nickels: number;
  pennies: number;
}

interface DenominationInputProps {
  onCountsChange: (counts: DenominationCounts, total: number) => void;
}

const denominations = [
  { key: 'pennies' as keyof DenominationCounts, label: 'Pennies', value: 0.01, icon: Coins },
  { key: 'nickels' as keyof DenominationCounts, label: 'Nickels', value: 0.05, icon: Coins },
  { key: 'dimes' as keyof DenominationCounts, label: 'Dimes', value: 0.10, icon: Coins },
  { key: 'quarters' as keyof DenominationCounts, label: 'Quarters', value: 0.25, icon: Coins },
  { key: 'ones' as keyof DenominationCounts, label: '$1 Bills', value: 1, icon: DollarSign },
  { key: 'fives' as keyof DenominationCounts, label: '$5 Bills', value: 5, icon: DollarSign },
  { key: 'tens' as keyof DenominationCounts, label: '$10 Bills', value: 10, icon: DollarSign },
  { key: 'twenties' as keyof DenominationCounts, label: '$20 Bills', value: 20, icon: DollarSign },
  { key: 'fifties' as keyof DenominationCounts, label: '$50 Bills', value: 50, icon: DollarSign },
  { key: 'hundreds' as keyof DenominationCounts, label: '$100 Bills', value: 100, icon: DollarSign },
];

export default function DenominationInput({ onCountsChange }: DenominationInputProps) {
  const [counts, setCounts] = useState<DenominationCounts>({
    hundreds: 0,
    fifties: 0,
    twenties: 0,
    tens: 0,
    fives: 0,
    ones: 0,
    quarters: 0,
    dimes: 0,
    nickels: 0,
    pennies: 0,
  });

  const calculateTotal = (newCounts: DenominationCounts) => {
    return denominations.reduce((total, denom) => {
      return total + (newCounts[denom.key] * denom.value);
    }, 0);
  };

  const handleCountChange = (key: keyof DenominationCounts, value: string) => {
    const numValue = parseInt(value) || 0;
    const newCounts = { ...counts, [key]: numValue };
    setCounts(newCounts);
    const total = calculateTotal(newCounts);
    onCountsChange(newCounts, total);
  };

  const total = calculateTotal(counts);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Cash Denomination Count
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {denominations.map((denom) => {
              const Icon = denom.icon;
              return (
                <div key={denom.key} className="space-y-2">
                  <Label htmlFor={denom.key} className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {denom.label}
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id={denom.key}
                      type="number"
                      min="0"
                      value={counts[denom.key]}
                      onChange={(e) => handleCountChange(denom.key, e.target.value)}
                      className="w-24"
                      data-testid={`input-${denom.key}`}
                    />
                    <span className="text-sm text-muted-foreground">
                      × ${denom.value.toFixed(2)} = ${(counts[denom.key] * denom.value).toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium">Total Cash Count:</span>
            <span className="text-2xl font-bold text-primary" data-testid="text-total-cash">
              ${total.toFixed(2)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export type { DenominationCounts };
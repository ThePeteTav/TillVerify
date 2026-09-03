import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Delete, User } from "lucide-react";

interface EmployeeOption {
  id: string;
  name: string;
}

const MAX_PIN_LENGTH = 5;

export default function PinLogin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<EmployeeOption | null>(null);
  const [pin, setPin] = useState("");

  const { data: employees, isLoading } = useQuery<EmployeeOption[]>({
    queryKey: ["/api/auth/employees"],
  });

  const loginMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/auth/login", {
        employeeId: selected!.id,
        pin,
      });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message.replace(/^\d+:\s*/, ""),
        variant: "destructive",
      });
      setPin("");
    },
  });

  const handleDigit = (digit: string) => {
    if (pin.length >= MAX_PIN_LENGTH) return;
    setPin(pin + digit);
  };

  const handleBackspace = () => setPin(pin.slice(0, -1));

  const handleSubmit = () => {
    if (pin.length < 4) return;
    loginMutation.mutate();
  };

  const handleChangeEmployee = () => {
    setSelected(null);
    setPin("");
  };

  if (!selected) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Who's clocking in?</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <p className="text-center text-muted-foreground">Loading employees...</p>
          )}
          {!isLoading && (!employees || employees.length === 0) && (
            <p className="text-center text-muted-foreground">
              No employees configured yet. Ask an admin to add one.
            </p>
          )}
          <div className="grid grid-cols-2 gap-3">
            {employees?.map((employee) => (
              <Button
                key={employee.id}
                variant="outline"
                className="h-16 flex-col gap-1"
                onClick={() => setSelected(employee)}
                data-testid={`button-select-employee-${employee.id}`}
              >
                <User className="h-5 w-5" />
                <span className="truncate w-full text-center">{employee.name}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <Button
          variant="ghost"
          size="sm"
          className="w-fit -ml-2 mb-1"
          onClick={handleChangeEmployee}
          data-testid="button-change-employee"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Not {selected.name}?
        </Button>
        <CardTitle className="text-center">Enter your PIN</CardTitle>
        <p className="text-center text-sm text-muted-foreground">{selected.name}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-center gap-3" data-testid="text-pin-dots">
          {Array.from({ length: MAX_PIN_LENGTH }).map((_, i) => (
            <div
              key={i}
              className={`h-4 w-4 rounded-full border-2 ${
                i < pin.length ? "bg-primary border-primary" : "border-muted-foreground/40"
              }`}
            />
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((digit) => (
            <Button
              key={digit}
              variant="outline"
              size="lg"
              className="h-14 text-xl"
              onClick={() => handleDigit(digit)}
              data-testid={`button-pin-${digit}`}
            >
              {digit}
            </Button>
          ))}
          <Button
            variant="ghost"
            size="lg"
            className="h-14"
            onClick={handleBackspace}
            data-testid="button-pin-backspace"
          >
            <Delete className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="h-14 text-xl"
            onClick={() => handleDigit("0")}
            data-testid="button-pin-0"
          >
            0
          </Button>
          <Button
            size="lg"
            className="h-14"
            disabled={pin.length < 4 || loginMutation.isPending}
            onClick={handleSubmit}
            data-testid="button-pin-submit"
          >
            {loginMutation.isPending ? "..." : "Enter"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

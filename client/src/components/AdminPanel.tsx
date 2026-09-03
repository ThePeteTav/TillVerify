import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Settings as SettingsIcon, Users, DollarSign, FileText, Plus, Edit2, Trash2 } from "lucide-react";

type Role = "employee" | "manager" | "admin";

interface Employee {
  id: string;
  name: string;
  role: Role;
  active: boolean;
}

interface SettingsData {
  startingCash: string;
  tolerance: string;
  requireManagerApproval: boolean;
  googleSheetId: string;
  companyLogo?: string;
}

interface Reconciliation {
  id: number;
  userName: string;
  createdAt: string;
  status: string;
  difference: string;
  isSubmitted: boolean;
}

const ROLE_BADGE: Record<Role, "destructive" | "default" | "secondary"> = {
  admin: "destructive",
  manager: "default",
  employee: "secondary",
};

const EMPTY_FORM = { name: "", role: "employee" as Role, pin: "", confirmPin: "", active: true };

function EmployeesTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Employee | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);

  const { data: employees, isLoading } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["/api/employees"] });

  const createMutation = useMutation({
    mutationFn: async (data: typeof form) => {
      const res = await apiRequest("POST", "/api/employees", {
        name: data.name,
        role: data.role,
        pin: data.pin,
      });
      return await res.json();
    },
    onSuccess: () => {
      invalidate();
      toast({ title: "Employee added" });
      setFormOpen(false);
    },
    onError: (error: Error) => toast({ title: "Error", description: error.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: async (data: typeof form & { id: string }) => {
      const payload: Record<string, unknown> = {
        name: data.name,
        role: data.role,
        active: data.active,
      };
      if (data.pin) payload.pin = data.pin;
      const res = await apiRequest("PUT", `/api/employees/${data.id}`, payload);
      return await res.json();
    },
    onSuccess: () => {
      invalidate();
      toast({ title: "Employee updated" });
      setFormOpen(false);
    },
    onError: (error: Error) => toast({ title: "Error", description: error.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/employees/${id}`);
    },
    onSuccess: () => {
      invalidate();
      toast({ title: "Employee removed" });
      setDeleteTarget(null);
    },
    onError: (error: Error) => toast({ title: "Error", description: error.message, variant: "destructive" }),
  });

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEdit = (employee: Employee) => {
    setEditing(employee);
    setForm({ name: employee.name, role: employee.role, pin: "", confirmPin: "", active: employee.active });
    setFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    const pinRequired = !editing;
    if ((pinRequired || form.pin) && !/^\d{4,5}$/.test(form.pin)) {
      toast({ title: "PIN must be 4-5 digits", variant: "destructive" });
      return;
    }
    if (form.pin && form.pin !== form.confirmPin) {
      toast({ title: "PINs do not match", variant: "destructive" });
      return;
    }

    if (editing) {
      updateMutation.mutate({ ...form, id: editing.id });
    } else {
      createMutation.mutate(form);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Employee Management
          </CardTitle>
          <Button onClick={openAdd} data-testid="button-add-employee">
            <Plus className="h-4 w-4 mr-2" />
            Add Employee
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && <p className="text-muted-foreground">Loading...</p>}
        <div className="space-y-4">
          {employees?.map((employee) => (
            <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarFallback>
                    {employee.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <p className="font-medium">{employee.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={ROLE_BADGE[employee.role]}>{employee.role}</Badge>
                <Badge variant={employee.active ? "secondary" : "outline"}>
                  {employee.active ? "active" : "inactive"}
                </Badge>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => openEdit(employee)}
                  data-testid={`button-edit-${employee.id}`}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setDeleteTarget(employee)}
                  data-testid={`button-delete-${employee.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {employees?.length === 0 && (
            <p className="text-muted-foreground text-center py-4">No employees yet.</p>
          )}
        </div>
      </CardContent>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Employee" : "Add Employee"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="employee-name">Name</Label>
                <Input
                  id="employee-name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  data-testid="input-employee-name"
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={form.role} onValueChange={(value: Role) => setForm({ ...form, role: value })}>
                  <SelectTrigger data-testid="select-employee-role">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="employee">Employee</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="employee-pin">
                  {editing ? "New PIN (leave blank to keep current)" : "PIN (4-5 digits)"}
                </Label>
                <Input
                  id="employee-pin"
                  type="password"
                  inputMode="numeric"
                  maxLength={5}
                  value={form.pin}
                  onChange={(e) => setForm({ ...form, pin: e.target.value.replace(/\D/g, "") })}
                  data-testid="input-employee-pin"
                />
              </div>
              {form.pin && (
                <div className="space-y-2">
                  <Label htmlFor="employee-pin-confirm">Confirm PIN</Label>
                  <Input
                    id="employee-pin-confirm"
                    type="password"
                    inputMode="numeric"
                    maxLength={5}
                    value={form.confirmPin}
                    onChange={(e) => setForm({ ...form, confirmPin: e.target.value.replace(/\D/g, "") })}
                    data-testid="input-employee-pin-confirm"
                  />
                </div>
              )}
              {editing && (
                <div className="flex items-center justify-between">
                  <Label htmlFor="employee-active">Active</Label>
                  <Switch
                    id="employee-active"
                    checked={form.active}
                    onCheckedChange={(checked) => setForm({ ...form, active: checked })}
                    data-testid="switch-employee-active"
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editing ? "Save Changes" : "Add Employee"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {deleteTarget?.name}?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes their login. Past reconciliations they submitted are kept.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteTarget && deleteMutation.mutate(deleteTarget.id)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

function SettingsTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useQuery<SettingsData>({ queryKey: ["/api/settings"] });
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<SettingsData>({
    startingCash: "200.00",
    tolerance: "5.00",
    requireManagerApproval: true,
    googleSheetId: "",
    companyLogo: "",
  });

  useEffect(() => {
    if (settings) {
      setForm({
        startingCash: settings.startingCash,
        tolerance: settings.tolerance,
        requireManagerApproval: settings.requireManagerApproval,
        googleSheetId: settings.googleSheetId || "",
        companyLogo: settings.companyLogo || "",
      });
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (data: SettingsData) => {
      const res = await apiRequest("PUT", "/api/settings", data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
      toast({ title: "Settings saved" });
      setIsEditing(false);
    },
    onError: (error: Error) => toast({ title: "Error", description: error.message, variant: "destructive" }),
  });

  if (isLoading) return <p className="text-muted-foreground">Loading...</p>;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Cash Drawer Settings
          </CardTitle>
          <Button
            variant={isEditing ? "default" : "outline"}
            onClick={() => setIsEditing(!isEditing)}
            data-testid="button-edit-settings"
          >
            {isEditing ? "Cancel" : "Edit Settings"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="startingCash">Default Starting Cash</Label>
            <Input
              id="startingCash"
              type="number"
              step="0.01"
              min="0"
              value={form.startingCash}
              onChange={(e) => setForm({ ...form, startingCash: e.target.value })}
              disabled={!isEditing}
              data-testid="input-starting-cash-setting"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tolerance">Discrepancy Tolerance</Label>
            <Input
              id="tolerance"
              type="number"
              step="0.01"
              min="0"
              value={form.tolerance}
              onChange={(e) => setForm({ ...form, tolerance: e.target.value })}
              disabled={!isEditing}
              data-testid="input-tolerance-setting"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="googleSheetId">Google Sheet ID</Label>
          <Input
            id="googleSheetId"
            value={form.googleSheetId}
            onChange={(e) => setForm({ ...form, googleSheetId: e.target.value })}
            disabled={!isEditing}
            data-testid="input-google-sheet-id-setting"
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="requireManagerApproval">Require Manager Approval</Label>
          <Switch
            id="requireManagerApproval"
            checked={form.requireManagerApproval}
            onCheckedChange={(checked) => setForm({ ...form, requireManagerApproval: checked })}
            disabled={!isEditing}
            data-testid="switch-manager-approval-setting"
          />
        </div>
        {isEditing && (
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending} data-testid="button-save-settings">
              {saveMutation.isPending ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ReportsTab() {
  const { data: reconciliations, isLoading } = useQuery<Reconciliation[]>({
    queryKey: ["/api/reconciliations"],
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Reconciliation Reports
          </CardTitle>
          <Button
            variant="outline"
            onClick={() => window.open("/api/reconciliations/export/excel/all", "_blank")}
            data-testid="button-export-all"
          >
            Export All (Excel)
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && <p className="text-muted-foreground">Loading...</p>}
        {!isLoading && (!reconciliations || reconciliations.length === 0) && (
          <p className="text-muted-foreground text-center py-8">No reconciliations yet.</p>
        )}
        {reconciliations && reconciliations.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Difference</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reconciliations.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{new Date(r.createdAt).toLocaleString()}</TableCell>
                  <TableCell>{r.userName}</TableCell>
                  <TableCell className="capitalize">{r.status.replace("_", " ")}</TableCell>
                  <TableCell>${parseFloat(r.difference).toFixed(2)}</TableCell>
                  <TableCell>{r.isSubmitted ? "Yes" : "No"}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`/api/reconciliations/${r.id}/pdf`, "_blank")}
                    >
                      PDF
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

export default function AdminPanel() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5" />
            Administration Panel
          </CardTitle>
        </CardHeader>
      </Card>

      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="employees">Employee Management</TabsTrigger>
          <TabsTrigger value="settings">Drawer Settings</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          <EmployeesTab />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <SettingsTab />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <ReportsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

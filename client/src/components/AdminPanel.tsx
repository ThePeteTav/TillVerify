import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Users, DollarSign, FileText, Plus, Edit2, Trash2 } from "lucide-react";

interface Employee {
  id: string;
  name: string;
  email: string;
  role: 'employee' | 'manager' | 'admin';
  status: 'active' | 'inactive';
  profileImage?: string;
}

interface DrawerSettings {
  startingCash: number;
  tolerance: number;
  requireManagerApproval: boolean;
}

export default function AdminPanel() {
  // todo: remove mock functionality
  const [employees] = useState<Employee[]>([
    {
      id: '1',
      name: 'John Smith',
      email: 'john@example.com',
      role: 'employee',
      status: 'active'
    },
    {
      id: '2', 
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      role: 'manager',
      status: 'active'
    },
    {
      id: '3',
      name: 'Mike Chen',
      email: 'mike@example.com', 
      role: 'employee',
      status: 'inactive'
    }
  ]);

  const [drawerSettings, setDrawerSettings] = useState<DrawerSettings>({
    startingCash: 200.00,
    tolerance: 5.00,
    requireManagerApproval: true
  });

  const [isEditing, setIsEditing] = useState(false);

  const handleSaveSettings = () => {
    console.log('Saving drawer settings:', drawerSettings);
    setIsEditing(false);
    // In real implementation, would save to backend
  };

  const handleAddEmployee = () => {
    console.log('Add employee triggered');
    // In real implementation, would open modal or navigate to form
  };

  const handleEditEmployee = (employeeId: string) => {
    console.log('Edit employee:', employeeId);
    // In real implementation, would open modal or navigate to form
  };

  const handleDeleteEmployee = (employeeId: string) => {
    console.log('Delete employee:', employeeId);
    // In real implementation, would show confirmation dialog
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'manager': return 'default';
      default: return 'secondary';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    return status === 'active' ? 'secondary' : 'outline';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
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
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Employee Management
                </CardTitle>
                <Button onClick={handleAddEmployee} data-testid="button-add-employee">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Employee
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {employees.map((employee) => (
                  <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={employee.profileImage} />
                        <AvatarFallback>
                          {employee.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-sm text-muted-foreground">{employee.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getRoleBadgeVariant(employee.role)}>
                        {employee.role}
                      </Badge>
                      <Badge variant={getStatusBadgeVariant(employee.status)}>
                        {employee.status}
                      </Badge>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEditEmployee(employee.id)}
                        data-testid={`button-edit-${employee.id}`}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteEmployee(employee.id)}
                        data-testid={`button-delete-${employee.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
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
                  {isEditing ? 'Cancel' : 'Edit Settings'}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="startingCash">Default Starting Cash</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">$</span>
                    <Input
                      id="startingCash"
                      type="number"
                      step="0.01"
                      min="0"
                      value={drawerSettings.startingCash}
                      onChange={(e) => setDrawerSettings(prev => ({
                        ...prev,
                        startingCash: parseFloat(e.target.value) || 0
                      }))}
                      disabled={!isEditing}
                      data-testid="input-starting-cash-setting"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Default amount of cash to start each day
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tolerance">Discrepancy Tolerance</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">$</span>
                    <Input
                      id="tolerance"
                      type="number"
                      step="0.01"
                      min="0"
                      value={drawerSettings.tolerance}
                      onChange={(e) => setDrawerSettings(prev => ({
                        ...prev,
                        tolerance: parseFloat(e.target.value) || 0
                      }))}
                      disabled={!isEditing}
                      data-testid="input-tolerance-setting"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Acceptable difference before flagging discrepancy
                  </p>
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveSettings} data-testid="button-save-settings">
                    Save Settings
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Reconciliation Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Historical Reports</h3>
                <p className="text-muted-foreground mb-4">
                  View and download historical reconciliation reports and analytics.
                </p>
                <Button variant="outline">
                  Coming Soon
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
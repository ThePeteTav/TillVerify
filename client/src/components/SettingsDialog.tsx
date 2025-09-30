import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings } from "lucide-react";

interface SettingsData {
  startingCash: string;
  tolerance: string;
  requireManagerApproval: boolean;
  googleSheetId: string;
  companyLogo?: string;
}

interface SettingsDialogProps {
  trigger?: React.ReactNode;
}

export default function SettingsDialog({ trigger }: SettingsDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery<SettingsData>({
    queryKey: ['/api/settings'],
    enabled: open,
  });

  const [formData, setFormData] = useState<SettingsData>({
    startingCash: settings?.startingCash || '200.00',
    tolerance: settings?.tolerance || '5.00',
    requireManagerApproval: settings?.requireManagerApproval ?? true,
    googleSheetId: settings?.googleSheetId || '',
    companyLogo: settings?.companyLogo || '',
  });

  useEffect(() => {
    if (open && settings) {
      setFormData({
        startingCash: settings.startingCash,
        tolerance: settings.tolerance,
        requireManagerApproval: settings.requireManagerApproval,
        googleSheetId: settings.googleSheetId || '',
        companyLogo: settings.companyLogo || '',
      });
    }
  }, [open, settings]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          title: "File too large",
          description: "Please select an image under 2MB",
          variant: "destructive",
        });
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, companyLogo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setFormData({ ...formData, companyLogo: '' });
  };

  const updateSettingsMutation = useMutation({
    mutationFn: async (data: SettingsData) => {
      const res = await apiRequest('PUT', '/api/settings', data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({
        title: "Success",
        description: "Settings updated successfully",
      });
      setOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettingsMutation.mutate(formData);
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="icon" data-testid="button-open-settings">
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Cash Drawer Settings
            </DialogTitle>
            <DialogDescription>
              Configure default settings for cash reconciliation
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="startingCash">Starting Cash in Register</Label>
              <Input
                id="startingCash"
                type="number"
                step="0.01"
                min="0"
                value={formData.startingCash}
                onChange={(e) => setFormData({ ...formData, startingCash: e.target.value })}
                data-testid="input-setting-starting-cash"
              />
              <p className="text-sm text-muted-foreground">
                Default amount of cash in register at start of day
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tolerance">Acceptable Tolerance ($)</Label>
              <Input
                id="tolerance"
                type="number"
                step="0.01"
                min="0"
                value={formData.tolerance}
                onChange={(e) => setFormData({ ...formData, tolerance: e.target.value })}
                data-testid="input-setting-tolerance"
              />
              <p className="text-sm text-muted-foreground">
                Maximum acceptable difference between expected and actual cash
              </p>
            </div>
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="requireManagerApproval">Require Manager Approval</Label>
                <p className="text-sm text-muted-foreground">
                  Require manager approval for reconciliations
                </p>
              </div>
              <Switch
                id="requireManagerApproval"
                checked={formData.requireManagerApproval}
                onCheckedChange={(checked) => setFormData({ ...formData, requireManagerApproval: checked })}
                data-testid="switch-manager-approval"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="googleSheetId">Google Sheet ID (Optional)</Label>
              <Input
                id="googleSheetId"
                type="text"
                placeholder="Enter Google Sheet ID from URL"
                value={formData.googleSheetId}
                onChange={(e) => setFormData({ ...formData, googleSheetId: e.target.value })}
                data-testid="input-setting-google-sheet-id"
              />
              <p className="text-sm text-muted-foreground">
                The ID from your Google Sheet URL (the part after /d/)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyLogo">Company Logo (Optional)</Label>
              {formData.companyLogo ? (
                <div className="space-y-2">
                  <img 
                    src={formData.companyLogo} 
                    alt="Company Logo" 
                    className="max-h-24 object-contain border rounded p-2"
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={removeLogo}
                    data-testid="button-remove-logo"
                  >
                    Remove Logo
                  </Button>
                </div>
              ) : (
                <Input
                  id="companyLogo"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  data-testid="input-setting-company-logo"
                />
              )}
              <p className="text-sm text-muted-foreground">
                Upload a company logo to appear on PDF reports (max 2MB)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              data-testid="button-cancel-settings"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={updateSettingsMutation.isPending}
              data-testid="button-save-settings"
            >
              {updateSettingsMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

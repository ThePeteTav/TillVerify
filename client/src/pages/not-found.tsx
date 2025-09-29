import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <CardHeader>
          <Calculator className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <CardTitle className="text-2xl">Page Not Found</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Button 
            onClick={() => window.location.href = '/'}
            className="w-full"
            data-testid="button-home"
          >
            <Home className="h-4 w-4 mr-2" />
            Return Home
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

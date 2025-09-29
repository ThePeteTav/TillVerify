import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, Shield, FileText, TrendingUp, CheckCircle, Clock } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = '/api/login';
  };

  const features = [
    {
      icon: Calculator,
      title: "Accurate Counting",
      description: "Systematic denomination counting with automatic calculations"
    },
    {
      icon: Shield,
      title: "Employee Authentication",
      description: "Secure login system with digital signatures for accountability"
    },
    {
      icon: FileText,
      title: "Automated Reports",
      description: "Generate PDF reports and Excel exports for record keeping"
    },
    {
      icon: TrendingUp,
      title: "POS Integration",
      description: "Compare cash drawer totals with point-of-sale system data"
    }
  ];

  const benefits = [
    "Eliminate calculation errors",
    "Streamline daily reconciliation",
    "Maintain accurate financial records",
    "Ensure employee accountability",
    "Generate audit-ready reports"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calculator className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">Cash Reconciliation</h1>
          </div>
          <Button onClick={handleLogin} size="lg" data-testid="button-login">
            Employee Login
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
            Professional Cash Register
            <span className="text-primary block">Reconciliation</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Streamline your daily cash counting process with our automated reconciliation system. 
            Ensure accuracy, maintain accountability, and generate comprehensive reports.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button onClick={handleLogin} size="lg" className="text-lg px-8" data-testid="button-get-started">
              Get Started
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold mb-4">Powerful Features</h3>
          <p className="text-muted-foreground text-lg">
            Everything you need for accurate and efficient cash reconciliation
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="hover-elevate">
                <CardHeader className="text-center">
                  <Icon className="h-12 w-12 text-primary mx-auto mb-4" />
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold mb-6">Why Choose Our System?</h3>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-chart-2 flex-shrink-0" />
                    <span className="text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            <Card className="p-8">
              <div className="text-center space-y-4">
                <Clock className="h-16 w-16 text-primary mx-auto" />
                <h4 className="text-2xl font-bold">Save Time Daily</h4>
                <p className="text-muted-foreground">
                  Reduce reconciliation time from 30+ minutes to under 5 minutes with 
                  our streamlined process and automated calculations.
                </p>
                <Button onClick={handleLogin} className="w-full" size="lg">
                  Start Saving Time
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 Cash Reconciliation System. Professional financial accuracy you can trust.</p>
        </div>
      </footer>
    </div>
  );
}
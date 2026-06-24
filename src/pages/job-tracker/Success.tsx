import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Home, Mail, ArrowLeft } from "lucide-react";

export default function Success() {
  const location = useLocation();
  const { name, email } = (location.state as { name?: string; email?: string }) || {};
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (countdown <= 0) {
      window.location.href = "/";
      return;
    }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardContent className="p-8 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Application Submitted!
          </h1>

          {name && (
            <p className="text-gray-600 mb-2">
              Hi <span className="font-semibold text-gray-900">{name}</span>, your application
              has been received successfully.
            </p>
          )}

          {email && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6">
              <Mail className="w-4 h-4" />
              We will contact you at <span className="font-medium">{email}</span>
            </div>
          )}

          <div className="bg-indigo-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-indigo-700">
              Your application is now under review. You will receive a confirmation email
              shortly. We will get back to you within 5-7 business days.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Link to="/">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700 gap-2">
                <Home className="w-4 h-4" />
                Back to Home
              </Button>
            </Link>

            <Link to="/apply">
              <Button variant="outline" className="w-full gap-2">
                <ArrowLeft className="w-4 h-4" />
                Submit Another Application
              </Button>
            </Link>
          </div>

          <p className="text-xs text-gray-400 mt-6">
            Redirecting to home in {countdown} seconds...
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

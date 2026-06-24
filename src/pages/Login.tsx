import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Chrome } from "lucide-react";

function getGoogleOAuthUrl(role: string) {
  const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
  const options = {
    redirect_uri: import.meta.env.VITE_GOOGLE_REDIRECT_URI || `${window.location.origin}/api/auth/google/callback`,
    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    access_type: "offline",
    response_type: "code",
    prompt: "consent",
    state: role, // Pass role in state
    scope: [
      "https://www.googleapis.com/auth/userinfo.profile",
      "https://www.googleapis.com/auth/userinfo.email",
    ].join(" "),
  };

  const qs = new URLSearchParams(options);
  return `${rootUrl}?${qs.toString()}`;
}

export default function Login() {
  const [role, setRole] = useState<"candidate" | "employer" | null>(null);

  const handleLogin = () => {
    if (!role) return;
    window.location.href = getGoogleOAuthUrl(role);
  };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md shadow-xl border-t-4 border-t-indigo-600">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-3xl font-bold text-gray-900">Welcome Back</CardTitle>
          <CardDescription className="text-gray-500">
            Sign in to manage your jobs or applications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={role === "candidate" ? "default" : "outline"}
              className={`h-24 flex flex-col gap-2 transition-all ${role === "candidate" ? "scale-105 shadow-md" : "opacity-70"}`}
              onClick={() => setRole("candidate")}
            >
              <span className="text-lg font-bold">Candidate</span>
              <span className="text-xs font-normal">I want a job</span>
            </Button>
            <Button
              variant={role === "employer" ? "default" : "outline"}
              className={`h-24 flex flex-col gap-2 transition-all ${role === "employer" ? "scale-105 shadow-md" : "opacity-70"}`}
              onClick={() => setRole("employer")}
            >
              <span className="text-lg font-bold">Employer</span>
              <span className="text-xs font-normal">I want to hire</span>
            </Button>
          </div>

          <Button
            className="w-full h-12 text-lg font-semibold gap-3 bg-indigo-600 hover:bg-indigo-700"
            disabled={!role}
            onClick={handleLogin}
          >
            <Chrome className="w-5 h-5" />
            Sign in with Google
          </Button>

          {!role && (
            <p className="text-center text-sm text-amber-600 animate-pulse">
              Please select your role first
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import {
  ArrowLeft,
  Loader2,
  Send,
  User,
  GraduationCap,
  BookOpen,
  Briefcase,
  AlertCircle,
} from "lucide-react";

interface FormData {
  name: string;
  email: string;
  phone: string;
  university: string;
  faculty: string;
  graduationYear: string;
  skills: string;
  cvLink: string;
  coverLetter: string;
}

export default function Apply() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const jobId = Number(searchParams.get("jobId"));
  const { user, isAuthenticated } = useAuth({ redirectOnUnauthenticated: true, redirectPath: "/login" });
  
  const { data: job, isLoading: jobLoading } = trpc.jobs.get.useQuery({ id: jobId }, { enabled: !!jobId });

  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    phone: "",
    university: "",
    faculty: "",
    graduationYear: "",
    skills: "",
    cvLink: "",
    coverLetter: "",
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  const submitMutation = trpc.applications.submit.useMutation({
    onSuccess: () => {
      toast.success("Application submitted successfully!");
      navigate("/candidate");
    },
    onError: (error) => toast.error(error.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobId) return toast.error("Invalid Job ID");
    
    submitMutation.mutate({
      ...formData,
      jobId,
    });
  };

  if (!jobId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="text-center p-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold mt-4">Invalid Application</h2>
          <p className="text-gray-500 mt-2">No job was selected for application.</p>
          <Link to="/" className="inline-block mt-6">
            <Button>View Jobs</Button>
          </Link>
        </Card>
      </div>
    );
  }

  if (jobLoading) return <div className="p-20 text-center">Loading job details...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 shadow-inner">
      <div className="max-w-4xl mx-auto space-y-8">
        <Link to="/" className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to listings
        </Link>

        {/* Job Banner */}
        <Card className="bg-indigo-700 text-white border-none shadow-xl overflow-hidden">
          <CardContent className="p-8 md:p-12 relative">
            <div className="absolute right-0 top-0 opacity-10 p-4">
              <Briefcase className="w-40 h-40" />
            </div>
            <div className="relative z-10 space-y-4">
              <span className="px-3 py-1 bg-white/20 text-xs font-bold rounded-full uppercase tracking-widest text-indigo-100">
                You are applying for
              </span>
              <h1 className="text-3xl md:text-5xl font-extrabold">{job?.title}</h1>
              <div className="flex flex-wrap gap-6 text-indigo-100/80 font-medium">
                <span className="flex items-center gap-2"><MapPin className="w-4 h-4" /> {job?.location}</span>
                <span className="flex items-center gap-2"><Briefcase className="w-4 h-4" /> {job?.type}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <Card className="shadow-lg border-none rounded-2xl">
              <CardHeader className="border-b border-gray-50">
                <CardTitle className="flex items-center gap-3">
                  <User className="w-6 h-6 text-indigo-600" />
                  Your Profile
                </CardTitle>
                <CardDescription>We've pre-filled some info from your Google account.</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-semibold px-1">Full Name</Label>
                    <Input disabled value={formData.name} className="bg-gray-50 border-gray-200" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold px-1">Email</Label>
                    <Input disabled value={formData.email} className="bg-gray-50 border-gray-200" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold px-1">Phone Number</Label>
                  <Input 
                    placeholder="01XXXXXXXXX" 
                    required 
                    value={formData.phone}
                    onChange={e => setFormData(p => ({...p, phone: e.target.value}))}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-none rounded-2xl">
              <CardHeader className="border-b border-gray-50">
                <CardTitle className="flex items-center gap-3">
                  <GraduationCap className="w-6 h-6 text-indigo-600" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="font-semibold">University</Label>
                      <Input 
                        placeholder="e.g. Cairo University" 
                        required 
                        value={formData.university}
                        onChange={e => setFormData(p => ({...p, university: e.target.value}))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="font-semibold">Faculty</Label>
                      <Input 
                        placeholder="e.g. Computer Science" 
                        required
                        value={formData.faculty}
                        onChange={e => setFormData(p => ({...p, faculty: e.target.value}))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-semibold">Graduation Year</Label>
                    <Input 
                      placeholder="e.g. 2025" 
                      required
                      value={formData.graduationYear}
                      onChange={e => setFormData(p => ({...p, graduationYear: e.target.value}))}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-none rounded-2xl">
              <CardHeader className="border-b border-gray-50">
                <CardTitle className="flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-indigo-600" />
                  Tell us more
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="space-y-2">
                  <Label className="font-semibold">Skills</Label>
                  <Textarea 
                    placeholder="List your top skills (React, Node, etc.)" 
                    required 
                    value={formData.skills}
                    onChange={e => setFormData(p => ({...p, skills: e.target.value}))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">CV Link (Google Drive/Dropbox)</Label>
                  <Input 
                    placeholder="https://..." 
                    type="url" 
                    required
                    value={formData.cvLink}
                    onChange={e => setFormData(p => ({...p, cvLink: e.target.value}))}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-semibold">Cover Letter (Optional)</Label>
                  <Textarea 
                    placeholder="Why are you the perfect fit?" 
                    className="min-h-[150px]" 
                    value={formData.coverLetter}
                    onChange={e => setFormData(p => ({...p, coverLetter: e.target.value}))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-indigo-50 border-indigo-100 shadow-none sticky top-24">
              <CardContent className="p-6 space-y-6">
                <h4 className="font-bold text-indigo-900 border-b border-indigo-200 pb-2 flex items-center gap-2">
                  <Send className="w-4 h-4" /> Final Step
                </h4>
                <p className="text-sm text-indigo-700 leading-relaxed">
                  Make sure all your information is accurate. Once submitted, your profile will be sent directly to the hiring team.
                </p>
                <Button 
                  type="submit" 
                  disabled={submitMutation.isPending}
                  className="w-full h-14 text-lg font-bold bg-indigo-600 hover:bg-indigo-700 shadow-lg rounded-xl transition-all hover:scale-105"
                >
                  {submitMutation.isPending ? <Loader2 className="animate-spin" /> : "Submit Application"}
                </Button>
                <p className="text-[10px] text-center text-indigo-400 font-medium">
                  By clicking submit, you confirm our terms.
                </p>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </div>
  );
}


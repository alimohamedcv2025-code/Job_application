import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Users, Briefcase, ChevronRight, Calendar, AlertCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Link } from "react-router";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function EmployerDashboard() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const [isPosting, setIsPosting] = useState(false);
  const utils = trpc.useUtils();

  const { data: myJobs, isLoading } = trpc.jobs.myJobs.useQuery();

  const createJob = trpc.jobs.create.useMutation({
    onSuccess: () => {
      toast.success("Job posted successfully!");
      setIsPosting(false);
      utils.jobs.myJobs.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createJob.mutate({
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      requirements: formData.get("requirements") as string,
      location: formData.get("location") as string,
      type: formData.get("type") as any,
    });
  };

  if (user?.role !== "employer") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md text-center p-8">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <CardTitle>Access Denied</CardTitle>
          <p className="text-gray-500 mt-2">Only employer accounts can access this dashboard.</p>
          <Link to="/" className="inline-block mt-6">
            <Button>Back to Home</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Employer Dashboard</h1>
          <p className="text-gray-500 text-lg">Manage your job openings and connect with top talent.</p>
        </div>

        <Dialog open={isPosting} onOpenChange={setIsPosting}>
          <DialogTrigger asChild>
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 shadow-lg rounded-full px-8 gap-2">
              <Plus className="w-5 h-5" />
              Post New Job
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Create Job Posting</DialogTitle>
              <DialogDescription>Fill in the details for your new vacancy.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Job Title</label>
                <Input name="title" placeholder="e.g. Senior Frontend Engineer" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Location</label>
                  <Input name="location" placeholder="e.g. Cairo, Egypt (Remote)" required />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Job Type</label>
                  <Select name="type" defaultValue="Full-time">
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Internship">Internship</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Description</label>
                <Textarea name="description" placeholder="Describe the role and your company..." className="min-h-[120px]" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Requirements</label>
                <Textarea name="requirements" placeholder="Skills, experience, etc." className="min-h-[100px]" required />
              </div>
              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 h-12" disabled={createJob.isPending}>
                {createJob.isPending ? "Posting..." : "Post Job Opportunity"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-indigo-50 border-none">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-indigo-600 rounded-xl">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-indigo-600 font-semibold uppercase text-xs tracking-wider">Active Jobs</p>
              <h4 className="text-2xl font-bold">{myJobs?.length || 0}</h4>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job List */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-gray-900 border-b pb-2">Your Listings</h3>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map(i => <div key={i} className="h-24 bg-gray-100 animate-pulse rounded-xl" />)}
          </div>
        ) : myJobs?.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-100">
            <Briefcase className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400">You haven't posted any jobs yet.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {myJobs?.map(job => (
              <Card key={job.id} className="hover:shadow-md transition-shadow group">
                <CardContent className="p-6 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="space-y-1">
                    <h4 className="text-lg font-bold text-gray-900">{job.title}</h4>
                    <div className="flex gap-4 text-sm text-gray-500 font-medium">
                      <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> Posted {new Date(job.createdAt).toLocaleDateString()}</span>
                      <span className="flex items-center gap-1"><Users className="w-4 h-4" /> Manage Applicants</span>
                    </div>
                  </div>
                  <Link to={`/employer/job/${job.id}`}>
                    <Button variant="outline" className="rounded-full group-hover:border-indigo-500 group-hover:text-indigo-600 transition-all">
                      View Applications
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

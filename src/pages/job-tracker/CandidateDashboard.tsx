import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { StatusBadge } from "@/components/job-tracker/StatusBadge";
import { Briefcase, Calendar, MapPin, AlertCircle, Clock, Info } from "lucide-react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";

export default function CandidateDashboard() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const { data: myApps, isLoading } = trpc.applications.myApplications.useQuery();

  if (user?.role !== "candidate") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md text-center p-8">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <CardTitle>Access Denied</CardTitle>
          <p className="text-gray-500 mt-2">Only candidate accounts can access this dashboard.</p>
          <Link to="/" className="inline-block mt-6">
            <Button>Back to Home</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-10">
      <div className="space-y-4">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">My Journey</h1>
        <p className="text-gray-500 text-xl max-w-2xl">Track your applications, interview schedules, and feedback in one place.</p>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {[1, 2].map(i => <div key={i} className="h-40 bg-gray-100 animate-pulse rounded-2xl" />)}
        </div>
      ) : myApps?.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100 shadow-sm">
          <div className="bg-indigo-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Briefcase className="w-10 h-10 text-indigo-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">No applications yet</h3>
          <p className="text-gray-500 mt-2 mb-8">Ready to find your dream job? Start exploring now.</p>
          <Link to="/">
            <Button size="lg" className="rounded-full bg-indigo-600 px-10">Browse Jobs</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {myApps?.map(({ application: app, job, interview }) => (
            <Card key={app.id} className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all rounded-2xl group">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-gray-100">
                  {/* Job & Status */}
                  <div className="p-8 flex-1 space-y-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-2">
                        <Link to={`/job/${job.id}`} className="text-xl font-bold text-gray-900 hover:text-indigo-600 transition-colors">
                          {job.title}
                        </Link>
                        <div className="flex items-center gap-4 text-sm text-gray-500 font-medium">
                          <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location}</span>
                          <span className="flex items-center gap-1 font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{job.type}</span>
                        </div>
                      </div>
                      <StatusBadge status={app.status as any} />
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-50 text-xs text-gray-400 font-medium uppercase tracking-widest">
                      Applied on {new Date(app.submittedAt).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' })}
                    </div>
                  </div>

                  {/* Interview Info or Feedback */}
                  <div className="md:w-1/3 bg-gray-50 p-8 flex flex-col justify-center gap-4">
                    {app.status === "Interviewing" && interview ? (
                      <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-sm space-y-3">
                        <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                          <Calendar className="w-4 h-4" />
                          Upcoming Interview
                        </div>
                        <div className="text-sm font-semibold text-gray-900">
                          {new Date(interview.scheduledAt).toLocaleString("en-US", { 
                            weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' 
                          })}
                        </div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {interview.location || "Online"}
                        </div>
                      </div>
                    ) : app.status === "Rejected" && app.rejectionReason ? (
                      <div className="bg-red-50 p-4 rounded-xl border border-red-100 space-y-2">
                        <div className="flex items-center gap-2 text-red-700 font-bold text-xs uppercase tracking-tight">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Feedback
                        </div>
                        <p className="text-sm text-red-600 italic">"{app.rejectionReason}"</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center space-y-2 opacity-50">
                        <Info className="w-6 h-6 text-gray-400" />
                        <p className="text-xs font-medium text-gray-500">
                          {app.status === "Pending" ? "Waiting for review" : "Stay tuned for updates"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

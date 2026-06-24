import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Clock, Briefcase, ChevronRight, Search } from "lucide-react";
import { Link } from "react-router";
import { useState } from "react";
import { Input } from "@/components/ui/input";

export default function Home() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  
  const { data: jobs, isLoading } = trpc.jobs.list.useQuery({
    search: search || undefined,
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Hero */}
      <section className="bg-indigo-700 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Find Your Next Career Move
          </h1>
          <p className="text-xl text-indigo-100 max-w-2xl mx-auto">
            Discover thousands of job opportunities or post your own to find the perfect candidate.
          </p>
          
          <div className="max-w-xl mx-auto relative group mt-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
            <Input 
              className="pl-12 h-14 bg-white text-gray-900 rounded-full shadow-lg border-2 border-transparent focus:border-indigo-400 transition-all text-lg"
              placeholder="Search job titles, skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Role Prompt if not logged in */}
      {!user && (
        <div className="max-w-7xl mx-auto mt-[-2rem] grid grid-cols-1 md:grid-cols-2 gap-6 w-full px-4 z-10">
          <Card className="shadow-xl hover:shadow-2xl transition-all border-l-4 border-l-indigo-500">
            <CardContent className="p-8 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Looking for work?</h3>
                <p className="text-gray-500">Apply to top companies in minutes.</p>
              </div>
              <Link to="/login">
                <Button size="lg" className="rounded-full px-8">Find a Job</Button>
              </Link>
            </CardContent>
          </Card>
          <Card className="shadow-xl hover:shadow-2xl transition-all border-l-4 border-l-purple-500">
            <CardContent className="p-8 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Want to hire?</h3>
                <p className="text-gray-500">Post your vacancies today.</p>
              </div>
              <Link to="/login">
                <Button variant="outline" size="lg" className="rounded-full px-8 border-purple-200 text-purple-700">Post a Job</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Job List */}
      <section className="max-w-5xl mx-auto w-full px-4 py-12 flex-1">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
          <Briefcase className="w-6 h-6 text-indigo-600" />
          {search ? `Searching for "${search}"` : "Latest Opportunities"}
        </h2>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-200 animate-pulse rounded-xl" />)}
          </div>
        ) : jobs?.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No jobs found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {jobs?.map((job) => (
              <Card key={job.id} className="hover:border-indigo-300 hover:shadow-md transition-all group overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row md:items-center p-6 gap-6">
                    <div className="bg-indigo-50 p-4 rounded-xl group-hover:bg-indigo-100 transition-colors">
                      <Briefcase className="w-10 h-10 text-indigo-600" />
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {job.title}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location}</span>
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {job.type}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <Link to={`/job/${job.id}`}>
                        <Button variant="ghost" className="gap-2 group/btn font-semibold text-indigo-600">
                          Details
                          <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                        </Button>
                      </Link>
                      <Link to={`/apply?jobId=${job.id}`}>
                        <Button className="bg-indigo-600 hover:bg-indigo-700 px-8 rounded-full">Apply Now</Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

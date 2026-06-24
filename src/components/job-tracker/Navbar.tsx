import { Link, useLocation } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Briefcase, LayoutDashboard, LogIn, LogOut, User, ClipboardList } from "lucide-react";

export function Navbar() {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  
  const isEmployer = user?.role === "employer";
  const isCandidate = user?.role === "candidate";

  return (
    <nav className="w-full bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-1.5 bg-indigo-600 rounded-lg group-hover:bg-indigo-700 transition-colors">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">HireFlow</span>
          </Link>

          <div className="flex items-center gap-4">
            {isAuthenticated && (
              <div className="hidden md:flex items-center gap-6 mr-4 border-r pr-6 border-gray-200">
                {isEmployer ? (
                  <Link to="/employer" className="text-sm font-medium text-gray-600 hover:text-indigo-600">
                    Employer Dashboard
                  </Link>
                ) : (
                  <Link to="/candidate" className="text-sm font-medium text-gray-600 hover:text-indigo-600">
                    My Applications
                  </Link>
                )}
                <Link to="/" className="text-sm font-medium text-gray-600 hover:text-indigo-600">
                  Find Jobs
                </Link>
              </div>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end text-right mr-1">
                  <div className="text-sm font-semibold text-gray-900 leading-none mb-1">
                    {user?.name}
                  </div>
                  <div className="text-xs text-gray-500 uppercase tracking-wider font-bold">
                    {user?.role}
                  </div>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full bg-gray-100 hover:bg-gray-200"
                >
                  <User className="w-4 h-4 text-gray-600" />
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="gap-2 text-gray-500 hover:text-red-600 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button variant="default" size="sm" className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}


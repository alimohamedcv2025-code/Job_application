import { Link, useLocation } from "react-router";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Briefcase, LayoutDashboard, LogIn, LogOut, User } from "lucide-react";

export function Navbar() {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const isAdminPage = location.pathname.startsWith("/admin");

  return (
    <nav className="w-full bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-indigo-600" />
            <span className="text-xl font-bold text-gray-900">JobTracker</span>
          </Link>

          <div className="flex items-center gap-4">
            {isAuthenticated && user?.role === "admin" && !isAdminPage && (
              <Link to="/admin">
                <Button variant="outline" size="sm" className="gap-2">
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Button>
              </Link>
            )}

            {isAdminPage && (
              <Link to="/">
                <Button variant="outline" size="sm" className="gap-2">
                  <Briefcase className="w-4 h-4" />
                  Back to Job
                </Button>
              </Link>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  {user?.name || user?.email}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="gap-2 text-gray-500"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link to="/login">
                <Button variant="ghost" size="sm" className="gap-2">
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

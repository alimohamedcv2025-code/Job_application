import { Routes, Route } from "react-router";
import { Navbar } from "@/components/job-tracker/Navbar";
import { Footer } from "@/components/job-tracker/Footer";
import { Toaster } from "@/components/ui/sonner";
import Home from "./pages/job-tracker/Home";
import Apply from "./pages/job-tracker/Apply";
import Success from "./pages/job-tracker/Success";
import AdminDashboard from "./pages/job-tracker/AdminDashboard";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />
        <Route
          path="/apply"
          element={
            <Layout>
              <Apply />
            </Layout>
          }
        />
        <Route path="/success" element={<Success />} />
        <Route
          path="/admin"
          element={
            <Layout>
              <AdminDashboard />
            </Layout>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

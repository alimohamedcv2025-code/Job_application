import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { trpc } from "@/providers/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { StatsCard } from "@/components/job-tracker/StatsCard";
import { StatusBadge } from "@/components/job-tracker/StatusBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  GraduationCap,
  Filter,
  Download,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  ExternalLink,
  FileText,
} from "lucide-react";

type StatusFilter = "All" | "Pending" | "Accepted" | "Rejected";

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth({
    redirectOnUnauthenticated: true,
    redirectPath: "/login",
  });

  const [search, setSearch] = useState("");
  const [university, setUniversity] = useState("");
  const [status, setStatus] = useState<StatusFilter>("All");
  const [page, setPage] = useState(1);
  const limit = 10;
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  const isAdmin = user?.role === "admin";

  // Fetch stats
  const { data: statsData, isLoading: statsLoading } = trpc.applications.stats.useQuery(
    undefined,
    { enabled: isAdmin }
  );

  // Fetch universities for filter
  const { data: universitiesData } = trpc.applications.universities.useQuery(
    undefined,
    { enabled: isAdmin }
  );

  // Fetch applications with filters
  const { data: listData, isLoading: listLoading } = trpc.applications.list.useQuery(
    {
      search: search || undefined,
      university: university || undefined,
      status: status === "All" ? undefined : status,
      page,
      limit,
    },
    { enabled: isAdmin }
  );

  const utils = trpc.useUtils();

  // Status update mutation
  const updateStatusMutation = trpc.applications.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status updated successfully");
      utils.applications.list.invalidate();
      utils.applications.stats.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update status");
    },
  });

  const handleStatusChange = (id: number, newStatus: "Pending" | "Accepted" | "Rejected") => {
    updateStatusMutation.mutate({ id, status: newStatus });
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleUniversityChange = (value: string) => {
    setUniversity(value);
    setPage(1);
  };

  const handleStatusFilterChange = (value: StatusFilter) => {
    setStatus(value);
    setPage(1);
  };

  // Export to Excel via tRPC
  const handleExport = async () => {
    try {
      const result = await utils.applications.exportExcel.fetch();
      if (result?.data?.content) {
        const binary = atob(result.data.content);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        const blob = new Blob([bytes], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = result.data.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success("Applications exported to Excel");
      }
    } catch {
      toast.error("Failed to export applications");
    }
  };

  // Generate pagination items
  const generatePaginationItems = () => {
    const totalPages = listData?.data.totalPages ?? 0;
    const items = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) items.push(i);
        items.push("ellipsis");
        items.push(totalPages);
      } else if (page >= totalPages - 2) {
        items.push(1);
        items.push("ellipsis");
        for (let i = totalPages - 3; i <= totalPages; i++) items.push(i);
      } else {
        items.push(1);
        items.push("ellipsis");
        for (let i = page - 1; i <= page + 1; i++) items.push(i);
        items.push("ellipsis");
        items.push(totalPages);
      }
    }
    return items;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Skeleton className="w-12 h-12 rounded-full mx-auto mb-4" />
          <Skeleton className="w-48 h-4 mx-auto" />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const stats = statsData?.data;
  const applications = listData?.data.applications ?? [];
  const totalPages = listData?.data.totalPages ?? 0;
  const total = listData?.data.total ?? 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500 mt-1">Manage and review all job applications</p>
          </div>
          <Button onClick={handleExport} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            ))
          ) : (
            <>
              <StatsCard
                title="Total Applications"
                value={stats?.total ?? 0}
                icon={Users}
                color="bg-indigo-500"
              />
              <StatsCard
                title="Pending Review"
                value={stats?.pending ?? 0}
                icon={Clock}
                color="bg-yellow-500"
              />
              <StatsCard
                title="Accepted"
                value={stats?.accepted ?? 0}
                icon={CheckCircle}
                color="bg-green-500"
              />
              <StatsCard
                title="Rejected"
                value={stats?.rejected ?? 0}
                icon={XCircle}
                color="bg-red-500"
              />
            </>
          )}
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by applicant name..."
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Select value={university} onValueChange={handleUniversityChange}>
                  <SelectTrigger className="w-[200px]">
                    <GraduationCap className="w-4 h-4 mr-2 text-gray-400" />
                    <SelectValue placeholder="All Universities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Universities</SelectItem>
                    {universitiesData?.map((uni) => (
                      <SelectItem key={uni} value={uni}>
                        {uni}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={status} onValueChange={(v) => handleStatusFilterChange(v as StatusFilter)}>
                  <SelectTrigger className="w-[160px]">
                    <Filter className="w-4 h-4 mr-2 text-gray-400" />
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Statuses</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Accepted">Accepted</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applications Table */}
        <Card>
          <CardContent className="p-0">
            {listLoading ? (
              <div className="p-6 space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="h-4 w-12" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            ) : applications.length === 0 ? (
              <div className="p-12 text-center">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 font-medium">No applications found</p>
                <p className="text-gray-400 text-sm mt-1">
                  {search || university || status !== "All"
                    ? "Try adjusting your filters"
                    : "Applications will appear here once candidates start applying"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-14">ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>University</TableHead>
                      <TableHead>Faculty</TableHead>
                      <TableHead>Skills</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-10"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((app) => (
                      <>
                        <TableRow
                          key={app.id}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() =>
                            setExpandedRow(expandedRow === app.id ? null : app.id)
                          }
                        >
                          <TableCell className="font-mono text-sm text-gray-500">
            #{app.id}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-gray-900">{app.name}</div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                <Mail className="w-3.5 h-3.5" />
                                {app.email}
                              </div>
                              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                                <Phone className="w-3.5 h-3.5" />
                                {app.phone}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {app.university}
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {app.faculty}
                          </TableCell>
                          <TableCell>
                            <div className="max-w-[200px] truncate text-sm text-gray-600">
                              {app.skills}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={app.status}
                              onValueChange={(value) =>
                                handleStatusChange(
                                  app.id,
                                  value as "Pending" | "Accepted" | "Rejected"
                                )
                              }
                            >
                              <SelectTrigger
                                className="w-[130px] h-8"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <StatusBadge status={app.status} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="Accepted">Accepted</SelectItem>
                                <SelectItem value="Rejected">Rejected</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-sm text-gray-500 whitespace-nowrap">
                            {new Date(app.submittedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {expandedRow === app.id ? (
                              <ChevronUp className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            )}
                          </TableCell>
                        </TableRow>
                        {expandedRow === app.id && (
                          <TableRow className="bg-gray-50">
                            <TableCell colSpan={9} className="p-4">
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="text-sm font-semibold text-gray-700 mb-1">
                                      CV Link
                                    </h4>
                                    <a
                                      href={app.cvLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" />
                                      Open CV
                                    </a>
                                  </div>
                                  <div>
                                    <h4 className="text-sm font-semibold text-gray-700 mb-1">
                                      Graduation Year
                                    </h4>
                                    <p className="text-sm text-gray-600">{app.graduationYear}</p>
                                  </div>
                                </div>
                                {app.coverLetter && (
                                  <div>
                                    <h4 className="text-sm font-semibold text-gray-700 mb-1">
                                      Cover Letter
                                    </h4>
                                    <p className="text-sm text-gray-600 whitespace-pre-wrap bg-white p-3 rounded border">
                                      {app.coverLetter}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 border-t">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Showing {(page - 1) * limit + 1} to{" "}
                    {Math.min(page * limit, total)} of {total} applications
                  </p>
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                          className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      {generatePaginationItems().map((item, i) => (
                        <PaginationItem key={i}>
                          {item === "ellipsis" ? (
                            <PaginationEllipsis />
                          ) : (
                            <PaginationLink
                              onClick={() => setPage(item as number)}
                              isActive={page === item}
                              className="cursor-pointer"
                            >
                              {item}
                            </PaginationLink>
                          )}
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                          className={
                            page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

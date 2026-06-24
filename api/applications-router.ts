import { z } from "zod";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { applications } from "@db/schema";
import { eq, like, and, sql, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { sendApplicationConfirmation } from "./email-service";
import * as XLSX from "xlsx";

// Validation schema for creating an application
const createApplicationSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().regex(/^01[0-2,5]{1}[0-9]{8}$/, "Enter a valid Egyptian phone number"),
  university: z.string().min(3, "University name is required"),
  faculty: z.string().min(1, "Faculty is required"),
  graduationYear: z.string().regex(/^20\d{2}$/, "Enter a valid graduation year"),
  skills: z.string().min(1, "Please enter at least one skill"),
  cvLink: z.string().url("Please enter a valid URL"),
  coverLetter: z.string().optional(),
});

// Schema for updating status
const updateStatusSchema = z.object({
  id: z.number(),
  status: z.enum(["Pending", "Accepted", "Rejected"]),
});

// Schema for querying applications (admin)
const listApplicationsSchema = z.object({
  search: z.string().optional(),
  university: z.string().optional(),
  status: z.enum(["Pending", "Accepted", "Rejected"]).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10),
});

export const applicationsRouter = createRouter({
  // Submit a new application (public)
  submit: publicQuery
    .input(createApplicationSchema)
    .mutation(async ({ input }) => {
      const db = getDb();

      const result = await db.insert(applications).values({
        name: input.name,
        email: input.email,
        phone: input.phone,
        university: input.university,
        faculty: input.faculty,
        graduationYear: input.graduationYear,
        skills: input.skills,
        cvLink: input.cvLink,
        coverLetter: input.coverLetter || null,
        status: "Pending",
      });

      const insertId = Number(result[0].insertId);

      // Send confirmation email (non-blocking)
      try {
        await sendApplicationConfirmation({
          name: input.name,
          email: input.email,
        });
      } catch {
        // Email failure should not break the submission flow
        console.log("[Application] Email notification skipped or failed");
      }

      return {
        success: true,
        message: "Application submitted successfully",
        data: {
          id: insertId,
          submittedAt: new Date().toISOString(),
        },
      };
    }),

  // Get all applications with filtering (admin only)
  list: adminQuery
    .input(listApplicationsSchema)
    .query(async ({ input }) => {
      const db = getDb();
      const { search, university, status, page, limit } = input;
      const offset = (page - 1) * limit;

      // Build conditions
      const conditions = [];
      if (search) {
        conditions.push(like(applications.name, `%${search}%`));
      }
      if (university) {
        conditions.push(eq(applications.university, university));
      }
      if (status) {
        conditions.push(eq(applications.status, status));
      }

      const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

      // Get total count
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(applications)
        .where(whereClause);
      const total = countResult[0]?.count ?? 0;

      // Get paginated applications
      const items = await db
        .select()
        .from(applications)
        .where(whereClause)
        .orderBy(desc(applications.submittedAt))
        .limit(limit)
        .offset(offset);

      return {
        success: true,
        data: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
          applications: items,
        },
      };
    }),

  // Update application status (admin only)
  updateStatus: adminQuery
    .input(updateStatusSchema)
    .mutation(async ({ input }) => {
      const db = getDb();

      // Check if application exists
      const existing = await db
        .select()
        .from(applications)
        .where(eq(applications.id, input.id))
        .limit(1);

      if (existing.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Application with ID ${input.id} not found`,
        });
      }

      await db
        .update(applications)
        .set({ status: input.status })
        .where(eq(applications.id, input.id));

      return {
        success: true,
        message: `Status updated to ${input.status}`,
        data: {
          id: input.id,
          status: input.status,
        },
      };
    }),

  // Get dashboard statistics (admin only)
  stats: adminQuery.query(async () => {
    const db = getDb();

    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(applications);
    const total = totalResult[0]?.count ?? 0;

    const pendingResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(applications)
      .where(eq(applications.status, "Pending"));
    const pending = pendingResult[0]?.count ?? 0;

    const acceptedResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(applications)
      .where(eq(applications.status, "Accepted"));
    const accepted = acceptedResult[0]?.count ?? 0;

    const rejectedResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(applications)
      .where(eq(applications.status, "Rejected"));
    const rejected = rejectedResult[0]?.count ?? 0;

    // Get unique universities
    const universityResult = await db
      .selectDistinct({ university: applications.university })
      .from(applications);
    const universities = universityResult.map((u) => u.university).filter(Boolean);

    // Get latest 5 applications
    const latestApplications = await db
      .select({
        id: applications.id,
        name: applications.name,
        submittedAt: applications.submittedAt,
      })
      .from(applications)
      .orderBy(desc(applications.submittedAt))
      .limit(5);

    return {
      success: true,
      data: {
        total,
        pending,
        accepted,
        rejected,
        universities,
        latestApplications,
      },
    };
  }),

  // Get unique universities for filter dropdown (admin only)
  universities: adminQuery.query(async () => {
    const db = getDb();
    const result = await db
      .selectDistinct({ university: applications.university })
      .from(applications)
      .orderBy(applications.university);
    return result.map((r) => r.university).filter(Boolean);
  }),

  // Export all applications to Excel (admin only)
  exportExcel: adminQuery.query(async () => {
    const db = getDb();

    const allApplications = await db
      .select()
      .from(applications)
      .orderBy(desc(applications.submittedAt));

    // Format data for Excel
    const excelData = allApplications.map((app) => ({
      ID: app.id,
      Name: app.name,
      Email: app.email,
      Phone: app.phone,
      University: app.university,
      Faculty: app.faculty,
      "Graduation Year": app.graduationYear,
      Skills: app.skills,
      "CV Link": app.cvLink,
      "Cover Letter": app.coverLetter || "",
      Status: app.status,
      "Submitted At": new Date(app.submittedAt).toLocaleString(),
    }));

    // Create workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const colWidths = [
      { wch: 6 },   // ID
      { wch: 20 },  // Name
      { wch: 28 },  // Email
      { wch: 14 },  // Phone
      { wch: 25 },  // University
      { wch: 22 },  // Faculty
      { wch: 12 },  // Graduation Year
      { wch: 35 },  // Skills
      { wch: 45 },  // CV Link
      { wch: 50 },  // Cover Letter
      { wch: 12 },  // Status
      { wch: 20 },  // Submitted At
    ];
    ws["!cols"] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, "Applications");

    // Generate buffer
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
    const base64 = Buffer.from(buf).toString("base64");

    return {
      success: true,
      data: {
        filename: `applications_${new Date().toISOString().split("T")[0]}.xlsx`,
        content: base64,
      },
    };
  }),
});

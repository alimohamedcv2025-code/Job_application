import { z } from "zod";
import { createRouter, publicQuery, authedProcedure, employerProcedure } from "./middleware";
import { getDb } from "./queries/connection";
import { applications, interviews, jobs } from "@db/schema";
import { eq, and, sql, desc, like } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { sendApplicationConfirmation } from "./email-service";
import * as XLSX from "xlsx";

const submitApplicationSchema = z.object({
  jobId: z.number(),
  name: z.string().min(3),
  email: z.string().email(),
  phone: z.string().min(10),
  university: z.string(),
  faculty: z.string(),
  graduationYear: z.string(),
  skills: z.string(),
  cvLink: z.string().url(),
  coverLetter: z.string().optional(),
});

const updateStatusSchema = z.object({
  id: z.number(),
  status: z.enum(["Pending", "Accepted", "Rejected", "Interviewing"]),
  rejectionReason: z.string().optional(),
});

const scheduleInterviewSchema = z.object({
  applicationId: z.number(),
  scheduledAt: z.date(),
  location: z.string().optional(),
  notes: z.string().optional(),
});

export const applicationsRouter = createRouter({
  submit: authedProcedure
    .input(submitApplicationSchema)
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const result = await db.insert(applications).values({
        ...input,
        candidateId: ctx.user.id,
        status: "Pending",
      });

      try {
        await sendApplicationConfirmation({ name: input.name, email: input.email });
      } catch (err) {
        console.error("Email failed", err);
      }

      return { success: true, id: Number(result[0].insertId) };
    }),

  // Candidate: My applications
  myApplications: authedProcedure.query(async ({ ctx }) => {
    const db = getDb();
    return db.select({
      application: applications,
      job: jobs,
      interview: interviews,
    })
    .from(applications)
    .innerJoin(jobs, eq(applications.jobId, jobs.id))
    .leftJoin(interviews, eq(applications.id, interviews.applicationId))
    .where(eq(applications.candidateId, ctx.user.id))
    .orderBy(desc(applications.submittedAt));
  }),

  // Employer: List applicants for a specific job
  listByJob: employerProcedure
    .input(z.object({ jobId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = getDb();
      // Verify job belongs to employer
      const job = await db.select().from(jobs).where(and(eq(jobs.id, input.jobId), eq(jobs.employerId, ctx.user.id))).limit(1);
      if (!job[0]) throw new TRPCError({ code: "FORBIDDEN" });

      return db.select()
        .from(applications)
        .where(eq(applications.jobId, input.jobId))
        .orderBy(desc(applications.submittedAt));
    }),

  updateStatus: employerProcedure
    .input(updateStatusSchema)
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(applications)
        .set({ status: input.status, rejectionReason: input.rejectionReason })
        .where(eq(applications.id, input.id));
      return { success: true };
    }),

  scheduleInterview: employerProcedure
    .input(scheduleInterviewSchema)
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(interviews).values(input);
      await db.update(applications).set({ status: "Interviewing" }).where(eq(applications.id, input.applicationId));
      return { success: true };
    }),
});


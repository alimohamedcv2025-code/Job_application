import { z } from "zod";
import { createRouter, publicQuery, employerProcedure, authedProcedure } from "./middleware";
import { getDb } from "./queries/connection";
import { jobs, users } from "@db/schema";
import { eq, desc, and, like } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

const createJobSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  requirements: z.string().min(10),
  location: z.string().min(2),
  type: z.enum(["Full-time", "Part-time", "Internship", "Contract"]),
});

const listJobsSchema = z.object({
  search: z.string().optional(),
  location: z.string().optional(),
  type: z.enum(["Full-time", "Part-time", "Internship", "Contract"]).optional(),
});

export const jobsRouter = createRouter({
  // Public: List all jobs
  list: publicQuery
    .input(listJobsSchema)
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];
      
      if (input.search) {
        conditions.push(like(jobs.title, `%${input.search}%`));
      }
      if (input.location) {
        conditions.push(eq(jobs.location, input.location));
      }
      if (input.type) {
        conditions.push(eq(jobs.type, input.type));
      }

      return db.select()
        .from(jobs)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(jobs.createdAt));
    }),

  // Public: Get single job details
  get: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const job = await db.select().from(jobs).where(eq(jobs.id, input.id)).limit(1);
      if (!job[0]) throw new TRPCError({ code: "NOT_FOUND" });
      return job[0];
    }),

  // Employer: Create a job
  create: employerProcedure
    .input(createJobSchema)
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      const result = await db.insert(jobs).values({
        ...input,
        employerId: ctx.user.id,
      });
      return { id: Number(result[0].insertId) };
    }),

  // Employer: My posted jobs
  myJobs: employerProcedure.query(async ({ ctx }) => {
    const db = getDb();
    return db.select()
      .from(jobs)
      .where(eq(jobs.employerId, ctx.user.id))
      .orderBy(desc(jobs.createdAt));
  }),

  // Finalize role setup
  setRole: authedProcedure
    .input(z.object({ role: z.enum(["candidate", "employer"]) }))
    .mutation(async ({ input, ctx }) => {
      const db = getDb();
      await db.update(users).set({ role: input.role }).where(eq(users.id, ctx.user.id));
      return { success: true };
    }),
});

import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  int,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  googleId: varchar("googleId", { length: 255 }).unique(), // Replacing unionId with googleId
  role: mysqlEnum("role", ["candidate", "employer", "admin"]).default("candidate").notNull(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const jobs = mysqlTable("jobs", {
  id: serial("id").primaryKey(),
  employerId: int("employerId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  requirements: text("requirements").notNull(),
  location: varchar("location", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["Full-time", "Part-time", "Internship", "Contract"]).default("Full-time").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Job = typeof jobs.$inferSelect;
export type InsertJob = typeof jobs.$inferInsert;

export const applications = mysqlTable("applications", {
  id: serial("id").primaryKey(),
  jobId: int("jobId").notNull(),
  candidateId: int("candidateId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  university: varchar("university", { length: 255 }).notNull(),
  faculty: varchar("faculty", { length: 255 }).notNull(),
  graduationYear: varchar("graduationYear", { length: 10 }).notNull(),
  skills: text("skills").notNull(),
  cvLink: text("cvLink").notNull(),
  coverLetter: text("coverLetter"),
  status: mysqlEnum("status", ["Pending", "Accepted", "Rejected", "Interviewing"]).default("Pending").notNull(),
  rejectionReason: text("rejectionReason"),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
});

export type Application = typeof applications.$inferSelect;
export type InsertApplication = typeof applications.$inferInsert;

export const interviews = mysqlTable("interviews", {
  id: serial("id").primaryKey(),
  applicationId: int("applicationId").notNull(),
  scheduledAt: timestamp("scheduledAt").notNull(),
  location: varchar("location", { length: 255 }), // Online or Physical address
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Interview = typeof interviews.$inferSelect;
export type InsertInterview = typeof interviews.$inferInsert;


import { authRouter } from "./auth-router";
import { applicationsRouter } from "./applications-router";
import { jobsRouter } from "./jobs-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  jobs: jobsRouter,
  applications: applicationsRouter,
});

export type AppRouter = typeof appRouter;


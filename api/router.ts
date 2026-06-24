import { authRouter } from "./auth-router";
import { applicationsRouter } from "./applications-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  applications: applicationsRouter,
});

export type AppRouter = typeof appRouter;

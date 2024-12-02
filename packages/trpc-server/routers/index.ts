import { inferRouterOutputs } from "@trpc/server";
import { router } from "@trpc-server/trpc/core";
import { authRoutes } from "@trpc-server/routers/auth";
import { userRoutes } from "@trpc-server/routers/user";

export const appRouter = router({
  auth: authRoutes,
  user: userRoutes,
});

export type AppRouter = typeof appRouter;
export type AppRouterType = inferRouterOutputs<AppRouter>;

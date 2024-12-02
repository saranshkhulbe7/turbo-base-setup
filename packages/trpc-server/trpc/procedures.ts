import {
  adminMiddleware,
  userMiddleware,
} from "@trpc-server/middlerware/auth-middleware";
import { errorHandler } from "@trpc-server/middlerware/error-middleware";
import { t } from "./core";

export const publicProcedure = t.procedure.use(errorHandler);
export const userProcedure = publicProcedure.use(userMiddleware);
export const adminProcedure = publicProcedure.use(adminMiddleware);

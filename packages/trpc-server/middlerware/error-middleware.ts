import { TRPCError } from "@trpc/server";
import { t } from "@trpc-server/trpc/core";
import { logger } from "@pal/logger";

export const errorHandler = t.middleware(async ({ next, ctx }) => {
  try {
    return await next();
  } catch (error: unknown) {
    if (error instanceof TRPCError) {
      logger.error(`TRPC Error [${error.code}]: ${error.message}`, {
        requestId: ctx.requestId, // Add requestId to logs
        path: ctx.req.url,
        stack: error.stack,
      });
      throw error;
    }

    if (error instanceof Error) {
      logger.error(`Unexpected Error: ${error.message}`, {
        requestId: ctx.requestId,
        path: ctx.req.url,
        stack: error.stack,
      });
    } else {
      logger.error("Unknown error type occurred.", {
        requestId: ctx.requestId,
        path: ctx.req.url,
        error,
      });
    }

    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong on the server.",
    });
  }
});

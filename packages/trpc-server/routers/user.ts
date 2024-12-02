import { logger } from "@pal/logger";
import { router } from "@trpc-server/trpc/core";
import { z } from "zod";
import { publicProcedure, userProcedure } from "@trpc-server/trpc/procedures";

export const userRoutes = router({
  create: userProcedure
    .input(
      z
        .object({
          name: z.string(),
          email: z.coerce.string().email().min(5),
          password: z.string().min(6),
          role: z.enum(["admin", "user"]),
        })
        .strict()
    )
    .mutation(async ({ input, ctx }) => {
      // throw new Error("my new error");
      const { requestId } = ctx;
      logger.info(
        `Creating user with data: ${JSON.stringify(input)} (requestId: ${requestId})`
      );
      return {
        status: "success",
        message: "User created successfully",
        data: {
          id: 1,
          name: "John Doe",
          email: "john.doe@example.com",
        },
        meta: {
          timestamp: new Date().toISOString(),
          requestId,
          path: null,
        },
      };
    }),
  all: publicProcedure.query(async (opts) => {
    return {
      message: "success",
      greet: "Hi Saransh",
      great: "Great",
    };
  }),
});

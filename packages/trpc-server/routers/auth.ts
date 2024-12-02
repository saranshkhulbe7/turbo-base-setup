import { router } from "@trpc-server/trpc/core";
import { publicProcedure } from "@trpc-server/trpc/procedures";

export const authRoutes = router({
  users: publicProcedure.query(() => [
    {
      id: "1",
      name: "John Doe",
    },
  ]),
});

import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "@pal/trpc-server/routers";

const app = new Hono();
app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
  })
);

export default app;

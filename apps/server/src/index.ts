import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "@pal/trpc-server/routers";
import { createFactory } from "hono/factory";
import { errorHandler } from "./middlewares";
import { z } from "zod";

export const factory = createFactory();

const app = new Hono();
app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
  })
);
app.onError((err, c) => {
  const error = errorHandler(c);
  return error;
});

export default app;

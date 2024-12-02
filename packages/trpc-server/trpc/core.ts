import { initTRPC } from "@trpc/server";
import { errorFormatter } from "../utils/error-formatter";
import { createContext } from "./context";

export const t = initTRPC.context<typeof createContext>().create({
  errorFormatter,
});

export const router = t.router;

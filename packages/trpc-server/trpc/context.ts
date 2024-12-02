import { inferAsyncReturnType } from "@trpc/server";
import { v4 as uuidv4 } from "uuid";

export const createContext = ({ req }: { req: Request }) => {
  return {
    requestId: uuidv4(),
    req,
  };
};

export type Context = inferAsyncReturnType<typeof createContext>;

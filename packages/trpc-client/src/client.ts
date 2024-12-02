import { createTRPCReact } from "@trpc/react-query";
import { AppRouter } from "@pal/trpc-server/routers";

export const trpcClient = createTRPCReact<AppRouter>();

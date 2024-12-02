import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import { AppRouter } from "@pal/trpc-server/routers";
export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: "/trpc",
    }),
  ],
});

// console.log(await trpc.user.all.query());

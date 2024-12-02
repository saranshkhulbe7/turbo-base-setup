import { t } from "@trpc-server/trpc/core";
import { parse } from "cookie";

export const userMiddleware = t.middleware(async ({ ctx, next }) => {
  return next();
  const cookies = ctx.req.headers.get("user-cookie");
  if (!cookies) {
    throw new Error("No cookies found. User is not authorized.");
  }

  const parsedCookies = parse(cookies);
  const userAccessToken = parsedCookies.userAccessToken;
  if (!userAccessToken) {
    throw new Error("User is not authorized: Token missing.");
  }
  return next();
});

export const adminMiddleware = t.middleware(async ({ ctx, next }) => {
  const cookies = ctx.req.headers.get("admin-cookie");
  if (!cookies) {
    throw new Error("No cookies found. Admin is not authorized.");
  }
  const parsedCookies = parse(cookies);
  const adminAccessToken = parsedCookies.adminAccessToken;
  if (!adminAccessToken) {
    throw new Error("Admin is not authorized: Admin token missing.");
  }
  return next();
});

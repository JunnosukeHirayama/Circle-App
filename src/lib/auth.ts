import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  // In development, accept requests from whichever localhost port `next dev`
  // picks. In production, lock this down to your real domain via BETTER_AUTH_URL.
  trustedOrigins:
    process.env.NODE_ENV === "production"
      ? [process.env.BETTER_AUTH_URL ?? "http://localhost:3000"]
      : Array.from({ length: 11 }, (_, i) => `http://localhost:${3000 + i}`),
  user: {
    additionalFields: {
      bio: { type: "string", required: false },
      affiliation: { type: "string", required: false },
      location: { type: "string", required: false },
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  // nextCookies() must be the last plugin so Set-Cookie headers propagate
  // correctly from server actions / route handlers.
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;

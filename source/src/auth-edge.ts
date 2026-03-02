import NextAuth from "next-auth";

const authSecret =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "strafig-web-secret-key-change-in-production";

// Minimal Edge-safe auth (no providers; only token/session verification)
export const { auth } = NextAuth({
  trustHost: true,
  basePath: "/api/auth",
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  providers: [],
  secret: authSecret,
});

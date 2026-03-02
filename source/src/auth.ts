import NextAuth, { type DefaultSession, type NextAuthConfig } from "next-auth";

// Type augmentation for session/user
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      avatar: string | null;
      permissions: string[];
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    avatar: string | null;
    permissions: string[];
  }
}

const authSecret =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "strafig-web-secret-key-change-in-production";

const isDev = process.env.NODE_ENV === "development";

export const { handlers, auth, signIn, signOut } = NextAuth(async (req) => {
  const isEdge = typeof (globalThis as any).EdgeRuntime !== "undefined";

  const baseConfig = {
    trustHost: true,
    basePath: "/api/auth",
    session: {
      strategy: "jwt" as const,
      maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    pages: {
      signIn: "/admin/auth/login",
    },
    secret: authSecret,
    debug: isDev,
  };

  // Edge (middleware) needs only token validation; avoid Node-only deps.
  if (isEdge) {
    const edgeConfig: NextAuthConfig = {
      ...baseConfig,
      providers: [] as unknown as NextAuthConfig["providers"],
    };
    return edgeConfig;
  }

  const { default: Credentials } = await import("next-auth/providers/credentials");
  const bcrypt = await import("bcryptjs");
  const { getUserByEmail, getFallbackUserByEmail } = await import("./lib/data/users.data");

  const nodeConfig = {
    ...baseConfig,
    providers: [
      Credentials({
        name: "Credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          const email = String(credentials?.email || "").trim().toLowerCase();
          if (!email || !credentials?.password) {
            return null;
          }

          try {
            const user = await getUserByEmail(email);

            if (!user || !user.isActive) {
              return null;
            }

            const compare = bcrypt.compare || bcrypt.default?.compare;
            const isPasswordValid = await compare(
              credentials.password as string,
              user.password
            );

            if (isPasswordValid) {
              return {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                avatar: user.avatar,
                permissions: user.permissions,
              };
            }

            // Fallback user file
            const fallbackUser = await getFallbackUserByEmail(email);
            if (fallbackUser) {
              const fallbackValid = await compare(
                credentials.password as string,
                fallbackUser.password
              );
              if (fallbackValid) {
                return {
                  id: fallbackUser.id,
                  email: fallbackUser.email,
                  name: fallbackUser.name,
                  role: fallbackUser.role,
                  avatar: fallbackUser.avatar,
                  permissions: fallbackUser.permissions,
                };
              }
            }
            return null;
          } catch (error) {
            console.error("AUTH: error during authorize", error);
            return null;
          }
        },
      }),
    ],
    callbacks: {
      async jwt({ token, user }: any) {
        if (user) {
          token.id = user.id;
          token.email = user.email;
          token.name = user.name;
          token.role = user.role;
          token.avatar = user.avatar;
          token.permissions = user.permissions;
        }
        return token;
      },
      async session({ session, token }: any) {
        if (token && session.user) {
          session.user.id = token.id as string;
          session.user.email = token.email as string;
          session.user.name = token.name as string;
          session.user.role = token.role as string;
          session.user.avatar = token.avatar as string | null;
          session.user.permissions = token.permissions as string[];
        }
        return session;
      },
    },
  };
  return nodeConfig;
});

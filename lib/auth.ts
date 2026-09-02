import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { onlyDigits } from "./masks/br";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    Credentials({
      id: "staff-credentials",
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          userType: "staff" as const,
          role: user.role,
        };
      },
    }),
    Credentials({
      id: "client-credentials",
      credentials: {
        cpf: {},
        password: {},
      },
      authorize: async (credentials) => {
        const cpfRaw = credentials?.cpf as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!cpfRaw || !password) return null;

        const cpf = onlyDigits(cpfRaw);
        const client = await prisma.client.findUnique({ where: { cpf } });
        if (!client?.passwordHash) return null;

        const valid = await bcrypt.compare(password, client.passwordHash);
        if (!valid) return null;

        return {
          id: client.id,
          name: client.fullName,
          email: client.email,
          userType: "client" as const,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        const u = user as { id: string; userType: "staff" | "client"; role?: "ADMIN" | "OPERATOR" };
        token.id = u.id;
        token.userType = u.userType;
        if (u.role) token.role = u.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.userType = token.userType as "staff" | "client";
        session.user.role = token.role as "ADMIN" | "OPERATOR" | undefined;
      }
      return session;
    },
  },
});

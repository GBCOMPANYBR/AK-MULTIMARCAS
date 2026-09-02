import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      userType: "staff" | "client";
      role?: "ADMIN" | "OPERATOR";
    } & DefaultSession["user"];
  }

  interface User {
    userType: "staff" | "client";
    role?: "ADMIN" | "OPERATOR";
  }
}

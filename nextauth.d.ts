import NextAuth, { DefaultSession, User as NextAuthUser } from "next-auth";
import { JWT } from "next-auth/jwt";

// 1️⃣ Define un tipo común para tu usuario
export interface AppUser {
  id: string;
  name: string;
  email: string;
  emailVerified?: boolean | Date | null; // acepta boolean o Date
  role: string;
  image?: string;
}

// 2️⃣ Extiende NextAuth
declare module "next-auth" {
  interface Session {
    user: AppUser & DefaultSession["user"];
  }

  interface User extends NextAuthUser, AppUser {}
}

// 3️⃣ Extiende JWT
declare module "next-auth/jwt" {
  interface JWT {
    data?: AppUser;
  }
}

import NextAuth,{DefaultSession} from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string,
      tier : "free" | "pro",
      googleId?:"string"
    } & DefaultSession["user"];
  }
  interface User extends DefaultUser {
    id: string;
    tier: "free" | "pro";
    googleId?:"string";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    tier: "free" | "pro";
    googleId?:"string";
  }
}
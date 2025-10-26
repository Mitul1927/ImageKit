import NextAuth,{DefaultSession} from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string,
      tier : "free" | "paid"
    } & DefaultSession["user"];
  }
  interface User extends DefaultUser {
    id: string;
    tier: "free" | "paid";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    tier: "free" | "paid";
  }
}
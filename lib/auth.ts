import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { connectToDatabase } from "./db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

interface GoogleProfile {
  id: string;
  name: string;
  email: string;
  picture: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }
        try {
          await connectToDatabase();
          const user = await User.findOne({ email: credentials.email });
          if (!user) {
            throw new Error("No user found with this");
          }
          const isValid = await bcrypt.compare(
            credentials.password,
            user.password
          );
          if (!isValid) {
            throw new Error("invalid password");
          }
          return {
            id: user._id.toString(),
            email: user.email,
            tier: user.tier || "free",
          };
        } catch (error) {
          console.error("Auth error", error);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
    async jwt({ token, user,account,profile }) {
       if (account && account.provider === "google" && profile) {
        const googleProfile = profile as GoogleProfile;

        let dbUser = await User.findOne({ googleId: googleProfile.id });
        if (!dbUser) {
          dbUser = await User.create({
            name: googleProfile.name,
            email: googleProfile.email,
            image: googleProfile.picture,
            googleId: googleProfile.id,
          });
        }
        token.id = dbUser._id.toString();
        token.tier = dbUser.tier || "free";
      }
      if (user) {
        token.id = user.id;
        token.tier = user.tier || "free";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.tier = token.tier as "free" | "paid";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
};

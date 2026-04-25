import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateUniqueAlias } from "./utils";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
        }

        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Clear large fields that might have leaked from providers or previous sessions
      if (token.picture) delete token.picture;
      if (token.image) delete token.image;

      if (user) {
        token.id = user.id;
        token.alias = (user as any).alias;
        token.role = (user as any).role;
        token.email = user.email;
        token.name = user.name;
      } else if (token.id) {
        // Refresh alias and role from DB occasionally
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { name: true, alias: true, role: true }
        });
        if (dbUser) {
          token.role = dbUser.role;
          if (!dbUser.alias && dbUser.name) {
            const newAlias = await generateUniqueAlias(dbUser.name);
            await prisma.user.update({
              where: { id: token.id as string },
              data: { alias: newAlias }
            });
            token.alias = newAlias;
          } else {
            token.alias = dbUser.alias;
          }
          token.name = dbUser.name;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.alias = token.alias as string;
        session.user.role = token.role as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        // Ensure image is NOT in the session cookie if it's large
        delete (session.user as any).image;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "fallback_secret_for_local_dev",
};

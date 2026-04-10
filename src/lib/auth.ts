import { prisma } from "@/lib/prisma";
import { compare } from "bcrypt";
import { getServerSession, type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

type AuthorizedUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  role: string;
  emailVerified: boolean;
};

const authSecret = process.env.NEXTAUTH_SECRET;

export function auth() { return getServerSession(authOptions); }

export const authOptions: NextAuthOptions = {
  secret: authSecret,
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<AuthorizedUser | null> {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({ where: { email: credentials.email } });
        if (!user) return null;
        if (user.isDeleted) return null;

        const isValidPassword = await compare(credentials.password, user.passwordHash);
        if (!isValidPassword) return null;
        
        return { 
          id: String(user.id),
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          email: user.email,
          role: user.role,
          emailVerified: user.emailVerified,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.name = [user.firstName, user.lastName].filter(Boolean).join(" ");
        token.emailVerified = user.emailVerified;
      }

      if (token.sub && token.emailVerified !== true) {
        const userId = Number(token.sub);

        if (Number.isFinite(userId)) {
          const dbUser = await prisma.user.findUnique({
            where: { id: userId },
            select: { emailVerified: true, isDeleted: true },
          });

          if (dbUser && !dbUser.isDeleted) {
            token.emailVerified = dbUser.emailVerified;
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
        session.user.role = token.role as string | undefined;
        session.user.firstName = token.firstName as string | undefined;
        session.user.lastName = token.lastName as string | undefined;
        session.user.emailVerified = token.emailVerified as boolean | undefined;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

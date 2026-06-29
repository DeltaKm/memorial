import NextAuth from 'next-auth';
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // Build list of admin accounts from env vars
        // Supports ADMIN_USERNAME / ADMIN_PASSWORD (legacy) plus
        // ADMIN_USERNAME_2 / ADMIN_PASSWORD_2, ADMIN_USERNAME_3 / ADMIN_PASSWORD_3, etc.
        const admins: { username: string; password: string }[] = [];

        if (process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD) {
          admins.push({ username: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD });
        }

        let index = 2;
        while (process.env[`ADMIN_USERNAME_${index}`] && process.env[`ADMIN_PASSWORD_${index}`]) {
          admins.push({
            username: process.env[`ADMIN_USERNAME_${index}`] as string,
            password: process.env[`ADMIN_PASSWORD_${index}`] as string,
          });
          index++;
        }

        const match = admins.find(
          (a) => a.username === credentials?.username && a.password === credentials?.password
        );

        if (match) {
          return {
            id: String(admins.indexOf(match) + 1),
            name: 'Admin',
            email: 'admin@memorial.com',
          };
        }
        return null;
      }
    })
  ],
  pages: {
    signIn: '/admin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = 'admin';
      }
      return token;
    },
    async session({ session, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          role: token.role as string,
        }
      };
    },
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

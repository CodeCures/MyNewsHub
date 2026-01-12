import NextAuth from "next-auth";
import type { User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { httpClient } from "./lib/httpClient";
import { LoginError } from "./types/next-auth";

export const { handlers, auth, signIn, signOut } = NextAuth({
  debug: process.env.NODE_ENV === "development",
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          console.log('[AUTH] Attempting login...');
          
          const { data } = await httpClient.post('/auth/login', {
            email: credentials.email,
            password: credentials.password,
          });

          console.log('[AUTH] Login successful for:', data.user?.email);

          return {
            id: data.user.id.toString(),
            name: data.user.name,
            email: data.user.email,
            roles: data.user.roles || [],
            permissions: data.user.permissions || [],
            accessToken: data.access_token,
          };
        } catch (error: any) {
          console.error('[AUTH] Login error:', error.response?.data || error.message);
          
          // Extract error message from Laravel response
          let errorMessage = 'An unexpected error occurred during login';
          
          if (error.response?.data) {
            const errorData = error.response.data;
            errorMessage = errorData.message || 
                          errorData.errors?.email?.[0] || 
                          errorData.errors?.password?.[0] ||
                          'The provided credentials are incorrect.';
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          // Throw CredentialsSignin error so NextAuth v5 can display it
          throw new LoginError(errorMessage);
        }
      },
    }),
  ],
  pages: {
    signIn: '/auth/login',
    error: '/auth/login', // Redirect errors to login page with error query param
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      // Allow sign in - errors are handled in authorize
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.roles = user.roles;
        token.permissions = user.permissions;
        token.accessToken = user.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id,
          name: token.name as string,
          email: token.email as string,
          roles: token.roles,
          permissions: token.permissions,
          accessToken: token.accessToken,
        };
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
  events: {
    async signOut({ token }) {
      // Call Laravel logout endpoint to revoke token
      if (token?.accessToken) {
        try {
          await httpClient.post('/auth/logout', {}, {
            headers: {
              'Authorization': `Bearer ${token.accessToken}`,
            },
          });
        } catch (error) {
          console.error('Logout error:', error);
        }
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

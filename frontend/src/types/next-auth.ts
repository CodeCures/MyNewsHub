import { CredentialsSignin } from "next-auth";

// Custom error class for better error messages
export class LoginError extends CredentialsSignin {
  constructor(message: string) {
    super();
    this.message = message;
  }
}

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      roles: string[];
      permissions: string[];
      accessToken: string;
    };
  }

  interface User {
    id: string;
    name: string;
    email: string;
    roles: string[];
    permissions: string[];
    accessToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    roles: string[];
    permissions: string[];
    accessToken: string;
  }
}

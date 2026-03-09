import { DefaultSession } from "next-auth"
import "next-auth"
import "next-auth/jwt"

declare module "next-auth" {
  interface User {
    firstName?: string
    lastName?: string
    role?: string
  }

  interface Session {
    user: {
      id?: string
      firstName?: string
      lastName?: string
      role?: string
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    firstName?: string
    lastName?: string
    role?: string
  }
}

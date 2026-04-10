// some functions for some server side validations
import { auth } from "@/lib/auth";

// function to check if user is valid.
export async function requireUser() {
  const session = await auth();

  if (!session || !session?.user) {// user's session expired
    throw new Error("Unauthorized");
  }

  const userId = Number(session.user.id);

  if (isNaN(userId)) {
    throw new Error("Invalid user id");
  }

  if (!session.user.emailVerified) {
    throw new Error("Email not verified");
  }

  return {
    ...session.user,
    id: userId, // convert into number for prisma indexes
  };
}

// check if user is of correct role
export async function requireRole(role: string) {
  const user = await requireUser();

  if (user.role !== role) {
    throw new Error("Forbidden");
  }

  return user;
}

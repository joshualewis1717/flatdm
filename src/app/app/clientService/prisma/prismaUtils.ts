'use server'
import { requireRole } from "@/userAuth";
import { Prisma, Role } from "@prisma/client";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ServiceResult<T> = 
  | { result: NonNullable<T>; error: null } 
  | { result: null; error: string };

// Infer the return type of requireRole so we stay in sync with its actual shape
type AuthUser = NonNullable<Awaited<ReturnType<typeof requireRole>>>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Resolves the authenticated user for the given role.
 * Throws a typed error on session timeout or wrong role so callers don't
 * need to null-check the return value.
 */
export async function withRole(role: Role): Promise<AuthUser> {
  const user = await requireRole(role);
  if (!user) throw new Error("Session expired. Please sign in again.");
  return user;
}

// function to parse prisma errors and return generic error messages.
function parsePrismaError(e: Prisma.PrismaClientKnownRequestError): string {
  switch (e.code) {
    case "P2002":
      return "This record already exists. Please check for duplicates.";
    case "P2003":
      return "This action references a record that does not exist.";
    case "P2025":
      return "The record you are trying to update or delete could not be found.";
    case "P2014":
      return "This change would violate a required relationship between records.";
    default:
      return "A database error occurred. Please try again.";
  }
}


/**
 * Wraps any async service function in a consistent try/catch and maps the
 * outcome to ServiceResult<T>.
 *
 * Usage:
 *   return runService(() => someAsyncWork());
 */
export async function runService<T>( fn: () => Promise<T>): Promise<ServiceResult<T>> {
  try {
    const result = await fn();
    return { result: result as NonNullable<T>, error: null };
  } catch (e) {
    console.error("[service error]", e);

    // if it is a prisma error, parse it and show a more human readable error
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      return { result: null, error: parsePrismaError(e) };
    }
    // if it is an erro that we coded up, display it
    const message = e instanceof Error ? e.message : "Something went wrong.";
    return { result: null, error: message };
  }
}
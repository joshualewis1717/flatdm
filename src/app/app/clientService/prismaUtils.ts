'use server'
import { requireRole } from "@/userAuth";
import { Role } from "@prisma/client";

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

/**
 * Wraps any async service function in a consistent try/catch and maps the
 * outcome to ServiceResult<T>.
 *
 * Usage:
 *   return runService(() => someAsyncWork());
 */
export async function runService<T>(
    fn: () => Promise<T>
  ): Promise<ServiceResult<T>> {
    try {
      const result = await fn();
      return { result: result as NonNullable<T>, error: null };
    } catch (e) {
      const message = e instanceof Error ? e.message : "Something went wrong.";
      console.error("[service error]", e);
      return { result: null, error: message };
    }
  }
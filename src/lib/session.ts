import { headers } from "next/headers";
import { cache } from "react";
import { auth } from "@/lib/auth";

/**
 * Returns the current session (user + session) or null.
 * Wrapped in React.cache so multiple calls in one request hit the DB once.
 */
export const getSession = cache(async () => {
  return auth.api.getSession({ headers: await headers() });
});

/** Returns the logged-in user or null. */
export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}

/** Reads the account role from a user object ("APPLICANT" | "ORGANIZER"). */
export function roleOf(user: { role?: string | null } | null | undefined): string {
  return user?.role ?? "APPLICANT";
}

export function isOrganizer(user: { role?: string | null } | null | undefined): boolean {
  return roleOf(user) === "ORGANIZER";
}

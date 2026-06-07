"use client";

import { createAuthClient } from "better-auth/react";

// No baseURL → the client targets the current origin, so auth works no matter
// which port `next dev` lands on (3000/3001/...).
export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession } = authClient;

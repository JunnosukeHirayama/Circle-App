"use client";

import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";

// No baseURL → the client targets the current origin, so auth works no matter
// which port `next dev` lands on (3000/3001/...).
// inferAdditionalFields teaches the client about our custom user fields (role,
// bio, ...) so signUp/useSession are correctly typed.
export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields({
      user: {
        role: { type: "string" },
        emailNotifications: { type: "boolean", required: false },
        bio: { type: "string", required: false },
        affiliation: { type: "string", required: false },
        location: { type: "string", required: false },
      },
    }),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;

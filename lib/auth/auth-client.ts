// butler factory , where we create our browser butler and tell it the place he works
//auth-client
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
});

// and export actions we need from this butler
export const { signIn, signUp, signOut, useSession } = authClient;

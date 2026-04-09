// lib/auth.ts

import { prisma } from "@/lib/prisma";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { betterAuth } from "better-auth";

// 1. The Head Butler reads the Master Plan
const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  // 👇 Add this section so the Butler knows email/password signups are allowed
  emailAndPassword: {
    enabled: true,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
});

// You can also export the auth object if needed elsewhere
export { auth };

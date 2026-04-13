"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    // Abstracted: Here we would call the auth client's reset password logic
    // e.g. authClient.resetPassword.email({ email })
    
    setIsSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 sm:p-6 p-8">
      <div className="w-full max-w-sm rounded-1xl bg-card p-6 ring-1 ring-border sm:p-8">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center justify-center">
            <Link href="/">
              <Image
                src="/logos/logo.svg"
                alt="Worklyn"
                width={120}
                height={120}
              />
            </Link>
          </div>

          <h2 className="mt-6 text-xl font-semibold tracking-tight text-foreground">
            Reset your password
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {isSubmitted 
              ? "Check your email for a reset link."
              : "Enter your email address and we will send you a reset link."}
          </p>
        </div>

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium tracking-wide text-muted-foreground">
                EMAIL ADDRESS
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 inline-flex w-11 items-center justify-center text-muted-foreground">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 w-full rounded-none border border-input bg-background pl-11 pr-4 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                  placeholder="name@company.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              className="h-11 w-full rounded-none bg-indigo-600 text-white shadow-sm hover:bg-indigo-700/90"
              disabled={!email.trim()}
            >
              Send Reset Link
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        ) : (
          <div className="mt-6 space-y-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsSubmitted(false)}
              className="h-11 w-full rounded-none bg-muted/60 hover:bg-muted"
            >
              Try another email
            </Button>
          </div>
        )}

        <p className="pt-6 text-center text-sm text-muted-foreground">
          Remember your password?{" "}
          <Link
            href="/signin"
            className="font-medium text-foreground underline underline-offset-4"
          >
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}

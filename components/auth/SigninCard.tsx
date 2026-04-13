"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth/auth-client";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const SigninCard = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [generalError, setGeneralError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const passwordType = showPassword ? "text" : "password";

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setGeneralError("");
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard", // Where to send them after a successful sign-in
      });
    } catch (error) {
      setGeneralError("Failed to sign in with Google. Please try again.");
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");

    if (!email.trim() || !password) {
      setGeneralError("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const { error } = await authClient.signIn.email({
        email,
        password,
        rememberMe,
      });
      if (error) {
        setGeneralError(
          error.message || "Something went wrong. Please try again.",
        );
        return;
      }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setGeneralError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-1xl bg-card p-6 ring-1 ring-border sm:p-8">
      <div className="flex flex-col items-center text-center">
        <div className=" inline-flex items-center justify-center ">
          <Link href="/">
            <Image
              src="/logos/logo.svg"
              alt="Worklyn"
              width={120}
               height={120}
            />
          </Link>
        </div>

        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back to your workspace.
        </p>
      </div>

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

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium tracking-wide text-muted-foreground">
              PASSWORD
            </label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-foreground underline underline-offset-4 hover:text-muted-foreground"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 inline-flex w-11 items-center justify-center text-muted-foreground">
              <Lock className="h-4 w-4" />
            </span>
            <input
              type={passwordType}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 w-full rounded-none border border-input bg-background pl-11 pr-12 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              placeholder="********"
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center text-muted-foreground hover:text-foreground"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-input"
          />
          Keep me signed in
        </label>

        {generalError && (
          <p className="text-center text-sm font-medium text-red-500">
            {generalError}
          </p>
        )}

        <Button
          type="submit"
          className="h-11 w-full rounded-none bg-indigo-600 text-white shadow-sm hover:bg-indigo-700/90"
          disabled={!email.trim() || !password || loading}
        >
          {loading ? "Logging in..." : "Login"}
          {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>

        <div className="flex items-center gap-3 py-1">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">
            OR CONTINUE WITH
          </span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <Button
          type="button"
          variant="outline"
          className="h-11 w-full rounded-none bg-muted/60 hover:bg-muted"
          disabled={loading}
          onClick={handleGoogleSignIn}
        >
          <FcGoogle className="mr-2 h-5 w-5" />
          Continue with Google
        </Button>

        <p className="pt-2 text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link
            href="/"
            className="font-medium text-foreground underline underline-offset-4"
          >
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
};

export default SigninCard;

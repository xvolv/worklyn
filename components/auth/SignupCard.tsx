"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { Button } from "@/components/ui/button";

const SignupCard = () => {
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Separate error states for better UX
  const [passwordMatchError, setPasswordMatchError] = useState("");
  const [passwordStrengthError, setPasswordStrengthError] = useState("");
  const [generalError, setGeneralError] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordType = showPassword ? "text" : "password";
  const confirmPasswordType = showConfirmPassword ? "text" : "password";

  // Real-time password validation
  const validatePassword = (
    newPassword: string,
    newConfirmPassword: string,
  ) => {
    // Reset errors
    setPasswordMatchError("");
    setPasswordStrengthError("");

    // 1. Check password strength
    if (newPassword) {
      if (newPassword.length < 8) {
        setPasswordStrengthError("Password must be at least 8 characters long");
      } else if (!/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword) || !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
        setPasswordStrengthError(
          "Password must contain letters, numbers, and special characters",
        );
      }
    }

    // 2. Check if passwords match (only if both fields have value)
    if (newPassword && newConfirmPassword) {
      if (newPassword !== newConfirmPassword) {
        setPasswordMatchError("Passwords do not match");
      }
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    validatePassword(value, confirmPassword);
  };

  const handleConfirmPasswordChange = (value: string) => {
    setConfirmPassword(value);
    validatePassword(password, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError("");

    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setGeneralError("Please fill in all fields");
      return;
    }

    if (passwordStrengthError || passwordMatchError) {
      setGeneralError("Please fix the errors above");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fullName,
          email,
          password,
          confirmPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setGeneralError(data.error || "Something went wrong");
        return;
      }

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);
      
      window.location.href = "/dashboard";
    } catch (error) {
      setGeneralError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-1xl bg-card p-6 ring-1 ring-border sm:p-8">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          Create your account
        </h2>
        <p className="text-sm text-muted-foreground">
          Start your 14-day free trial. No credit card required.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {/* Full Name */}
        <div className="space-y-2">
          <label className="text-xs font-medium tracking-wide text-muted-foreground">
            FULL NAME
          </label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="h-11 w-full rounded-none border border-input bg-background px-4 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            placeholder="John Doe"
            autoComplete="name"
            required
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="text-xs font-medium tracking-wide text-muted-foreground">
            WORK EMAIL
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 w-full rounded-none border border-input bg-background px-4 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
            placeholder="name@company.com"
            autoComplete="email"
            required
          />
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label className="text-xs font-medium tracking-wide text-muted-foreground">
            PASSWORD
          </label>
          <div className="relative">
            <input
              type={passwordType}
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              className={`h-11 w-full rounded-none border bg-background px-4 pr-12 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 ${
                passwordStrengthError
                  ? "border-red-500 focus-visible:ring-red-500/40"
                  : "border-input"
              }`}
              placeholder="Create a password"
              autoComplete="new-password"
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

          {/* Password Strength Error */}
          {passwordStrengthError && (
            <p className="text-xs text-red-500">{passwordStrengthError}</p>
          )}

          {/* Helper Text */}
          <p className="text-xs text-muted-foreground">
            Must be at least 8 characters with letters and numbers.
          </p>
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <label className="text-xs font-medium tracking-wide text-muted-foreground">
            CONFIRM PASSWORD
          </label>
          <div className="relative">
            <input
              type={confirmPasswordType}
              value={confirmPassword}
              onChange={(e) => handleConfirmPasswordChange(e.target.value)}
              className={`h-11 w-full rounded-none border bg-background px-4 pr-12 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 ${
                passwordMatchError
                  ? "border-red-500 focus-visible:ring-red-500/40"
                  : "border-input"
              }`}
              placeholder="Confirm your password"
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center text-muted-foreground hover:text-foreground"
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          {/* Password Match Error */}
          {passwordMatchError && (
            <p className="text-xs text-red-500">{passwordMatchError}</p>
          )}
        </div>

        {/* General Error */}
        {generalError && (
          <p className="text-sm text-red-500 text-center font-medium">
            {generalError}
          </p>
        )}

        <Button
          type="submit"
          className="h-11 w-full rounded-none bg-indigo-600 text-white shadow-sm hover:bg-indigo-700/90"
          disabled={
            !!passwordStrengthError ||
            !!passwordMatchError ||
            !fullName.trim() ||
            !email.trim() ||
            !password ||
            !confirmPassword ||
            loading
          }
        >
          {loading ? "Creating account..." : "Sign up"}
          {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>

        {/* Rest of the form (OR divider + Google button + legal text) remains the same */}
        <div className="flex items-center gap-3 py-1">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">OR</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <Button
          type="button"
          variant="outline"
          className="h-11 w-full rounded-none bg-muted/60 hover:bg-muted"
          disabled={loading}
        >
          <FcGoogle className="mr-2 h-5 w-5" />
          Sign up with Google
        </Button>

        <p className="pt-2 text-center text-xs text-muted-foreground">
          By clicking "Sign up", you agree to our{" "}
          <Link
            href="#"
            className="text-foreground underline underline-offset-4"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="#"
            className="text-foreground underline underline-offset-4"
          >
            Privacy Policy
          </Link>
          .
        </p>
      </form>
    </div>
  );
};

export default SignupCard;

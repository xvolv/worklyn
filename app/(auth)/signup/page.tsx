import Link from "next/link";
import SignupCard from "@/components/auth/SignupCard";
const SignupPage = () => {
  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto w-full max-w-md">
        <SignupCard />
        <div className="pt-4 text-center text-sm text-muted-foreground">
          <Link
            href="/signin"
            className="hover:text-foreground hover:underline"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;

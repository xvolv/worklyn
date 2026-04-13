import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const LandingPageHeader = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold tracking-tight"
        >
          <Image
            src="/logos/logo.svg"
            alt="Worklyn"
            width={100}
            height={100}
            className="h-14 w-24"
            priority
          />
        </Link>

        <div className="flex items-center gap-4">
          {session ? (
            <Link
              href="/dashboard"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-indigo-700"
            >
              Go to Dashboard
            </Link>
          ) : (
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/signin"
                className="font-medium text-black underline-offset-4 hover:underline"
              >
                Login
              </Link>
            </p>
          )}
        </div>
      </nav>
    </header>
  );
};

export default LandingPageHeader;

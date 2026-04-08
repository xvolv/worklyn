import Link from "next/link";
import Image from "next/image";

const LandingPageHeader = () => {
  return (
    <header className="w-full">
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

        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/signin"
            className="font-medium text-black underline-offset-4 hover:underline"
          >
            Login
          </Link>
        </p>
      </nav>
    </header>
  );
};

export default LandingPageHeader;

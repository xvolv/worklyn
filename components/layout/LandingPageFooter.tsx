import Image from "next/image";
import Link from "next/link";

const LandingPageFooter = () => {
  return (
    <footer className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="flex items-center gap-3">
        <Link href="/">
          <Image src="/logos/logo.svg" alt="Worklyn" width={100} height={100} />
        </Link>
        <span className="hidden h-3 w-px bg-border sm:inline-block" />
        <span>© 2026 Worklyn Inc. All rights reserved.</span>
      </div>

      <div className="flex flex-wrap gap-x-8 gap-y-2">
        <a className="hover:text-foreground" href="#">
          Privacy Policy
        </a>
        <a className="hover:text-foreground" href="#">
          Terms of Service
        </a>
        <a className="hover:text-foreground" href="#">
          Help Center
        </a>
      </div>
    </footer>
  );
};

export default LandingPageFooter;

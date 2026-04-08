import Link from "next/link";

const LandingPageHeader = () => {
  return (
    <div>
      <nav className="flex justify-between items-center p-4">
        <h1>Worklyn</h1>
        <p>
          already have an account?{" "}
          <span className="text-blue-500">
            <Link href="/signin">Login</Link>
          </span>{" "}
        </p>
      </nav>
    </div>
  );
};

export default LandingPageHeader;

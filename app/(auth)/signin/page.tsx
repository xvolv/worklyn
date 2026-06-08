import Link from "next/link";
import SigninCard from "@/components/auth/SigninCard";
import LandingPageFooter from "@/components/layout/LandingPageFooter";
import LandingPageHeader from "@/components/layout/LandingPageHeader";

const SigninPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <LandingPageHeader />
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-md">
          <SigninCard />
        </div>
      </main>

      <LandingPageFooter />
    </div>
  );
};

export default SigninPage;

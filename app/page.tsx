import SignupCard from "@/app/(auth)/signup/page";
import Header from "@/components/layout/LandingPageHeader";
import LandingPageFooter from "@/components/layout/LandingPageFooter";
import LandingHero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Testimonials from "@/components/landing/Testimonials";
export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-10 px-4 pb-12 pt-6 sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:gap-12">
        <section className="flex-1 pt-4 lg:pt-10">
          <LandingHero />
          <Features />
          <Testimonials />
        </section>

        <section className="w-full pt-2 lg:w-[440px] lg:pt-10">
          <SignupCard />
        </section>
      </main>

      <LandingPageFooter />
    </div>
  );
}

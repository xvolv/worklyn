import SignupCard from "@/app/(auth)/signup/page";
import Header from "@/components/layout/LandingPageHeader";
import LandingHero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import Testimonials from "@/components/landing/Testimonials";
export default function Home() {
  return (
    <div className="">
      <Header />
      <main className="flex ">
        <section>
          <LandingHero />
          <Features />
          <Testimonials />
        </section>
        <section>
          <SignupCard />
        </section>
      </main>
    </div>
  );
}

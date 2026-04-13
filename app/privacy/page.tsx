import Header from "@/components/layout/LandingPageHeader";
import LandingPageFooter from "@/components/layout/LandingPageFooter";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="mx-auto flex-1 w-full max-w-4xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-6">Privacy Policy</h1>
        <div className="prose prose-indigo max-w-none text-muted-foreground">
          <p>Last updated: April 2026</p>
          <p>
            This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information
            when You use the Service and tells You about Your privacy rights.
          </p>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Information We Collect</h2>
          <p>
            We collect information that you provide directly to us when you create an account, create a workspace, or interact with our platform.
            This includes your name, email address, and Profile Information.
          </p>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, You can contact us at support@worklyn.app.
          </p>
        </div>
      </main>
      <LandingPageFooter />
    </div>
  );
}

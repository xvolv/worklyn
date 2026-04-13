import Header from "@/components/layout/LandingPageHeader";
import LandingPageFooter from "@/components/layout/LandingPageFooter";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="mx-auto flex-1 w-full max-w-4xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-6">Terms of Service</h1>
        <div className="prose prose-indigo max-w-none text-muted-foreground">
          <p>Last updated: April 2026</p>
          <p>
            Please read these terms and conditions carefully before using Our Service.
          </p>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Acceptance of Terms</h2>
          <p>
            By accessing or using Worklyn, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the Service.
          </p>
          <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Workspace and Content</h2>
          <p>
            You are responsible for the content and projects you create in your workspaces. We reserve the right to suspend accounts that violate our community guidelines.
          </p>
        </div>
      </main>
      <LandingPageFooter />
    </div>
  );
}

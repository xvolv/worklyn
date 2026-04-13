import Header from "@/components/layout/LandingPageHeader";
import LandingPageFooter from "@/components/layout/LandingPageFooter";
import { Mail, MessageCircle, FileText } from "lucide-react";

export default function HelpCenter() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="mx-auto flex-1 w-full max-w-4xl px-4 py-12 sm:px-6">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-4">Help Center</h1>
        <p className="text-muted-foreground mb-10">How can we assist you today?</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-border rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="h-10 w-10 bg-indigo-50 rounded-lg flex items-center justify-center mb-4">
              <Mail className="h-5 w-5 text-indigo-600" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Email Support</h3>
            <p className="text-sm text-muted-foreground mb-4">Reach out to our team directly via email for any inquiries.</p>
            <a href="mailto:support@worklyn.app" className="text-sm font-medium text-indigo-600 hover:underline">support@worklyn.app</a>
          </div>

          <div className="border border-border rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="h-10 w-10 bg-emerald-50 rounded-lg flex items-center justify-center mb-4">
              <FileText className="h-5 w-5 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Documentation</h3>
            <p className="text-sm text-muted-foreground mb-4">Browse our comprehensive guides and tutorials.</p>
            <span className="text-sm font-medium text-emerald-600">Coming soon</span>
          </div>

          <div className="border border-border rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="h-10 w-10 bg-amber-50 rounded-lg flex items-center justify-center mb-4">
              <MessageCircle className="h-5 w-5 text-amber-600" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Community Discord</h3>
            <p className="text-sm text-muted-foreground mb-4">Join our community to ask questions and share ideas.</p>
            <span className="text-sm font-medium text-amber-600">Coming soon</span>
          </div>
        </div>
      </main>
      <LandingPageFooter />
    </div>
  );
}

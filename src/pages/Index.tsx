import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { RepoManager } from "@/components/RepoManager";
import { HeroSection } from "@/components/home/HeroSection";
import { FeatureGrid } from "@/components/home/FeatureGrid";
import { Button } from "@/components/ui/button";
import { GitBranch, GitMerge, GitPullRequest } from "lucide-react";

const Index = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background to-background/95">
        <AppSidebar />
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="sr-only">Git Tools Dashboard</h1>
              <SidebarTrigger className="md:hidden" />
            </div>
            
            <HeroSection />
            <section aria-label="Features" role="region">
              <FeatureGrid />
            </section>
            <section aria-label="Repository Manager" role="region">
              <RepoManager />
            </section>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Index;

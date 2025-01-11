import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Header } from "@/components/Header";
import { RepoManager } from "@/components/RepoManager";

const Index = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1">
          <Header />
          <main className="container p-6">
            <div className="grid gap-6">
              <RepoManager />
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Index;
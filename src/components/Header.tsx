import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GitBranch } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex items-center gap-2 mr-8">
          <GitBranch className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg">Git Tools</span>
        </div>
        <Tabs defaultValue="repositories" className="w-full">
          <TabsList>
            <TabsTrigger value="repositories">Repositories</TabsTrigger>
            <TabsTrigger value="push">Push Operations</TabsTrigger>
            <TabsTrigger value="pull">Pull Requests</TabsTrigger>
            <TabsTrigger value="merge">Merge</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </header>
  );
}
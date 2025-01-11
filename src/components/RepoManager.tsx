import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { GitBranch } from "lucide-react";

export function RepoManager() {
  const [repoUrl, setRepoUrl] = useState("");
  const [pushType, setPushType] = useState("regular");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!repoUrl) {
      toast({
        title: "Error",
        description: "Please enter a repository URL",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Success",
      description: `Repository added: ${repoUrl}`,
    });
  };

  return (
    <Card className="p-6 bg-secondary/50 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-6">
        <GitBranch className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-semibold">Repository Manager</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="repoUrl" className="text-sm font-medium">
            Repository URL
          </label>
          <Input
            id="repoUrl"
            placeholder="https://github.com/username/repo.git"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            className="bg-background/50"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="pushType" className="text-sm font-medium">
            Push Type
          </label>
          <Select value={pushType} onValueChange={setPushType}>
            <SelectTrigger className="bg-background/50">
              <SelectValue placeholder="Select push type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="regular">Regular Push</SelectItem>
              <SelectItem value="force">Force Push</SelectItem>
              <SelectItem value="force-with-lease">Force with Lease</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button type="submit" className="w-full">
          Add Repository
        </Button>
      </form>
    </Card>
  );
}
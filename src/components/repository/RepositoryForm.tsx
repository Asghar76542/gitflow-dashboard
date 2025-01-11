import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { GitBranch } from "lucide-react";

interface RepositoryFormProps {
  onRepositoryAdded: () => void;
}

export function RepositoryForm({ onRepositoryAdded }: RepositoryFormProps) {
  const [repoUrl, setRepoUrl] = useState("");
  const [repoLabel, setRepoLabel] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAddRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!repoUrl) {
      toast({
        title: "Error",
        description: "Please enter a repository URL",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('repositories')
        .insert({
          url: repoUrl,
          name: repoUrl.split('/').pop()?.replace('.git', '') || '',
          nickname: repoLabel,
          is_master: false,
          status: 'synced'
        })
        .select()
        .single();

      if (error) throw error;

      // Fetch last commit information
      await supabase.functions.invoke('git-operations', {
        body: {
          type: 'getLastCommit',
          sourceRepoId: data.id
        }
      });

      setRepoUrl("");
      setRepoLabel("");
      onRepositoryAdded();
      
      toast({
        title: "Success",
        description: `Repository added: ${repoLabel || repoUrl}`,
      });
    } catch (error) {
      console.error('Error adding repository:', error);
      toast({
        title: "Error",
        description: "Failed to add repository",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleAddRepo} className="space-y-4">
      <div className="flex items-center gap-2 mb-6">
        <GitBranch className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-semibold">Repository Manager</h2>
      </div>
      
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
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="repoLabel" className="text-sm font-medium">
          Repository Label (Optional)
        </label>
        <Input
          id="repoLabel"
          placeholder="e.g., Production, Staging, Feature-X"
          value={repoLabel}
          onChange={(e) => setRepoLabel(e.target.value)}
          className="bg-background/50"
          disabled={isLoading}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Adding..." : "Add Repository"}
      </Button>
    </form>
  );
}
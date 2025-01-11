import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { GitBranch, GitCommit, Star, History } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface Repository {
  id: string;
  url: string;
  isMaster: boolean;
  lastPushed?: string;
  lastCommit?: string;
}

export function RepoManager() {
  const [repositories, setRepositories] = useState<Repository[]>(() => {
    const saved = localStorage.getItem('git-repositories');
    return saved ? JSON.parse(saved) : [];
  });
  const [repoUrl, setRepoUrl] = useState("");
  const [pushType, setPushType] = useState("regular");
  const [selectedSourceRepo, setSelectedSourceRepo] = useState("");
  const [selectedTargetRepo, setSelectedTargetRepo] = useState("");
  const [lastAction, setLastAction] = useState<string>("");
  const { toast } = useToast();

  useEffect(() => {
    localStorage.setItem('git-repositories', JSON.stringify(repositories));
  }, [repositories]);

  const handleAddRepo = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!repoUrl) {
      toast({
        title: "Error",
        description: "Please enter a repository URL",
        variant: "destructive",
      });
      return;
    }

    const newRepo: Repository = {
      id: crypto.randomUUID(),
      url: repoUrl,
      isMaster: repositories.length === 0, // First repo added is master by default
      lastPushed: new Date().toISOString(),
      lastCommit: "Initial commit"
    };

    setRepositories(prev => [...prev, newRepo]);
    setRepoUrl("");
    
    toast({
      title: "Success",
      description: `Repository added: ${repoUrl}`,
    });
  };

  const handlePushRepo = () => {
    if (!selectedSourceRepo || !selectedTargetRepo) {
      toast({
        title: "Error",
        description: "Please select both source and target repositories",
        variant: "destructive",
      });
      return;
    }

    // Simulate push operation
    const timestamp = new Date().toISOString();
    setRepositories(prev => prev.map(repo => {
      if (repo.id === selectedTargetRepo) {
        return { ...repo, lastPushed: timestamp };
      }
      return repo;
    }));

    setLastAction(`Pushed from ${selectedSourceRepo} to ${selectedTargetRepo} at ${new Date().toLocaleTimeString()}`);
    
    toast({
      title: "Success",
      description: `Push completed with ${pushType} strategy`,
    });
  };

  const toggleMaster = (id: string) => {
    setRepositories(prev => prev.map(repo => ({
      ...repo,
      isMaster: repo.id === id
    })));
  };

  return (
    <Card className="p-6 space-y-6 bg-secondary/50 backdrop-blur-sm">
      <div className="flex items-center gap-2 mb-6">
        <GitBranch className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-semibold">Repository Manager</h2>
      </div>
      
      <form onSubmit={handleAddRepo} className="space-y-4">
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

        <Button type="submit" className="w-full">
          Add Repository
        </Button>
      </form>

      <div className="space-y-4 pt-4 border-t border-border/50">
        <h3 className="text-lg font-medium">Push Repository</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Source Repository</label>
            <Select value={selectedSourceRepo} onValueChange={setSelectedSourceRepo}>
              <SelectTrigger className="bg-background/50">
                <SelectValue placeholder="Select source repository" />
              </SelectTrigger>
              <SelectContent>
                {repositories.map(repo => (
                  <SelectItem key={repo.id} value={repo.id}>
                    {repo.url} {repo.isMaster && <Star className="inline h-4 w-4 ml-2" />}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Target Repository</label>
            <Select value={selectedTargetRepo} onValueChange={setSelectedTargetRepo}>
              <SelectTrigger className="bg-background/50">
                <SelectValue placeholder="Select target repository" />
              </SelectTrigger>
              <SelectContent>
                {repositories.map(repo => (
                  <SelectItem key={repo.id} value={repo.id}>
                    {repo.url} {repo.isMaster && <Star className="inline h-4 w-4 ml-2" />}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Push Type</label>
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

        <Button onClick={handlePushRepo} className="w-full">
          Push Repository
        </Button>
      </div>

      {repositories.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-border/50">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <History className="h-5 w-5" />
            Repository History
          </h3>
          <div className="space-y-2">
            {repositories.map(repo => (
              <div key={repo.id} className="flex items-center justify-between p-3 rounded-md bg-background/50">
                <div className="flex items-center gap-2">
                  <GitCommit className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{repo.url}</span>
                  {repo.isMaster ? (
                    <Star className="h-4 w-4 text-yellow-500" />
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleMaster(repo.id)}
                      className="text-xs"
                    >
                      Set as Master
                    </Button>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  Last pushed: {repo.lastPushed ? new Date(repo.lastPushed).toLocaleString() : 'Never'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {lastAction && (
        <div className="pt-4 border-t border-border/50">
          <h3 className="text-lg font-medium mb-2">Last Action</h3>
          <div className="bg-background/50 p-3 rounded-md">
            <p className="text-sm text-muted-foreground">{lastAction}</p>
          </div>
        </div>
      )}
    </Card>
  );
}
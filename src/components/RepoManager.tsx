import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { GitBranch, GitCommit, Star, History, Tag, AlertTriangle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Repository {
  id: string;
  url: string;
  label?: string;
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
  const [repoLabel, setRepoLabel] = useState("");
  const [pushType, setPushType] = useState("regular");
  const [selectedSourceRepo, setSelectedSourceRepo] = useState("");
  const [selectedTargetRepo, setSelectedTargetRepo] = useState("");
  const [lastAction, setLastAction] = useState<string>("");
  const [showMasterWarning, setShowMasterWarning] = useState(false);
  const [confirmationStep, setConfirmationStep] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    localStorage.setItem('git-repositories', JSON.stringify(repositories));
  }, [repositories]);

  const handleAddRepo = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!repoUrl) {
      console.error("Repository URL is required");
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
      label: repoLabel,
      isMaster: repositories.length === 0,
      lastPushed: new Date().toISOString(),
      lastCommit: "Initial commit"
    };

    console.log("Adding new repository:", { url: repoUrl, label: repoLabel });
    setRepositories(prev => [...prev, newRepo]);
    setRepoUrl("");
    setRepoLabel("");
    
    toast({
      title: "Success",
      description: `Repository added: ${repoLabel || repoUrl}`,
    });
  };

  const handlePushRepo = () => {
    if (!selectedSourceRepo || !selectedTargetRepo) {
      console.error("Source and target repositories must be selected");
      toast({
        title: "Error",
        description: "Please select both source and target repositories",
        variant: "destructive",
      });
      return;
    }

    const targetRepo = repositories.find(r => r.id === selectedTargetRepo);
    
    if (targetRepo?.isMaster && confirmationStep === 0) {
      console.warn("Attempting to push to master repository - requiring confirmation");
      setShowMasterWarning(true);
      return;
    }

    const sourceRepo = repositories.find(r => r.id === selectedSourceRepo);
    
    // Simulate push operation with detailed logging
    console.log(`%cPush Operation Started`, 'color: blue; font-weight: bold');
    console.log(`From: ${sourceRepo?.label || sourceRepo?.url}`);
    console.log(`To: ${targetRepo?.label || targetRepo?.url}`);
    console.log(`Type: ${pushType}`);

    const timestamp = new Date().toISOString();
    setRepositories(prev => prev.map(repo => {
      if (repo.id === selectedTargetRepo) {
        return { ...repo, lastPushed: timestamp };
      }
      return repo;
    }));

    const actionMessage = `Pushed from ${sourceRepo?.label || sourceRepo?.url} to ${targetRepo?.label || targetRepo?.url} at ${new Date().toLocaleTimeString()}`;
    setLastAction(actionMessage);
    console.log(`%cPush Operation Completed: ${actionMessage}`, 'color: green');
    
    toast({
      title: "Success",
      description: `Push completed with ${pushType} strategy`,
    });

    // Reset confirmation state
    setConfirmationStep(0);
    setShowMasterWarning(false);
  };

  const handleMasterWarningConfirm = () => {
    setConfirmationStep(prev => prev + 1);
    if (confirmationStep < 2) {
      console.warn(`Master push confirmation step ${confirmationStep + 1} of 3`);
    } else {
      handlePushRepo();
    }
  };

  const toggleMaster = (id: string) => {
    console.log("Toggling master repository:", id);
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
                    {repo.label || repo.url}
                    {repo.isMaster && <Star className="inline h-4 w-4 ml-2 text-red-500" />}
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
                    {repo.label || repo.url}
                    {repo.isMaster && <Star className="inline h-4 w-4 ml-2 text-red-500" />}
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
              <div 
                key={repo.id} 
                className={`flex items-center justify-between p-3 rounded-md transition-colors ${
                  repo.isMaster ? 'bg-red-500/10 border border-red-500/20' : 'bg-background/50'
                }`}
              >
                <div className="flex items-center gap-2">
                  <GitCommit className={`h-4 w-4 ${repo.isMaster ? 'text-red-500' : 'text-muted-foreground'}`} />
                  <span className="text-sm">{repo.url}</span>
                  {repo.label && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {repo.label}
                    </Badge>
                  )}
                  {repo.isMaster ? (
                    <Star className="h-4 w-4 text-red-500" />
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

      <AlertDialog open={showMasterWarning} onOpenChange={setShowMasterWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              Warning: Pushing to Master Repository
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmationStep === 0 && "This is a master repository. Are you sure you want to proceed with the push operation?"}
              {confirmationStep === 1 && "Please confirm again. This action will modify the master repository."}
              {confirmationStep === 2 && "Final confirmation required. This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setConfirmationStep(0);
              setShowMasterWarning(false);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleMasterWarningConfirm}
              className="bg-red-500 hover:bg-red-600"
            >
              {confirmationStep === 2 ? "Confirm Push" : "Continue"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

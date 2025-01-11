import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Star, RefreshCw, CheckCircle, XCircle } from "lucide-react";
import { Repository, VerificationStatus } from "@/types/repository";

interface RepositoryPushControlsProps {
  repositories: Repository[];
  onPushComplete: () => void;
  onVerificationComplete: (status: VerificationStatus) => void;
  addConsoleLog: (message: string, type: 'error' | 'success' | 'info') => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export function RepositoryPushControls({
  repositories,
  onPushComplete,
  onVerificationComplete,
  addConsoleLog,
  isLoading,
  setIsLoading
}: RepositoryPushControlsProps) {
  const [selectedSourceRepo, setSelectedSourceRepo] = useState("");
  const [selectedTargetRepos, setSelectedTargetRepos] = useState<string[]>([]);
  const [pushType, setPushType] = useState("regular");
  const { toast } = useToast();

  const verifyPushSuccess = async (sourceRepoId: string, targetRepoIds: string[]) => {
    try {
      onVerificationComplete({ checking: true });
      addConsoleLog('Verifying push success...', 'info');

      const sourceDetails = repositories.find(r => r.id === sourceRepoId);
      if (!sourceDetails?.last_commit) {
        throw new Error('Source commit information not available');
      }

      // Verify commits match
      const targetRepos = repositories.filter(r => targetRepoIds.includes(r.id));
      const successfulTargets = targetRepos.filter(
        target => target.last_commit === sourceDetails.last_commit
      );

      const allSuccess = successfulTargets.length === targetRepoIds.length;
      const timestamp = new Date().toLocaleTimeString();

      onVerificationComplete({
        checking: false,
        success: allSuccess,
        message: allSuccess 
          ? `Push verified successful at ${timestamp}` 
          : `Push verification failed at ${timestamp}. Some repositories may not be in sync.`
      });

      addConsoleLog(
        allSuccess ? 'Push verification successful' : 'Push verification failed',
        allSuccess ? 'success' : 'error'
      );

    } catch (error) {
      console.error('Verification error:', error);
      onVerificationComplete({
        checking: false,
        success: false,
        message: `Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
      addConsoleLog(`Push verification error: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  const handlePushRepo = async () => {
    if (!selectedSourceRepo || selectedTargetRepos.length === 0) {
      toast({
        title: "Error",
        description: "Please select source and at least one target repository",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsLoading(true);
      addConsoleLog(`Starting ${pushType} push operation to multiple targets...`, 'info');
      
      for (const targetId of selectedTargetRepos) {
        const { error } = await supabase.functions.invoke('git-operations', {
          body: {
            type: 'push',
            sourceRepoId: selectedSourceRepo,
            targetRepoId: targetId,
            pushType
          }
        });

        if (error) throw error;
      }

      const sourceRepo = repositories.find(r => r.id === selectedSourceRepo);
      const targetRepos = repositories.filter(r => selectedTargetRepos.includes(r.id));
      const actionMessage = `Pushed from ${sourceRepo?.nickname || sourceRepo?.url} to ${targetRepos.length} repositories at ${new Date().toLocaleTimeString()}`;
      
      addConsoleLog(actionMessage, 'success');
      
      // Start verification process
      await verifyPushSuccess(selectedSourceRepo, selectedTargetRepos);
      
      onPushComplete();
      
      toast({
        title: "Success",
        description: `Push completed with ${pushType} strategy`,
      });
    } catch (error) {
      console.error('Error during push operation:', error);
      addConsoleLog(`Push operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      toast({
        title: "Error",
        description: "Failed to complete push operation",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Push Repository</h3>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Source Repository (Select One)</label>
          <Select 
            value={selectedSourceRepo} 
            onValueChange={(value) => {
              setSelectedSourceRepo(value);
              setSelectedTargetRepos([]);
            }}
            disabled={isLoading}
          >
            <SelectTrigger className="bg-background/50">
              <SelectValue placeholder="Select source repository" />
            </SelectTrigger>
            <SelectContent>
              {repositories.map(repo => (
                <SelectItem key={repo.id} value={repo.id}>
                  {repo.nickname || repo.url}
                  {repo.is_master && <Star className="inline h-4 w-4 ml-2 text-red-500" />}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Target Repositories (Select Multiple)</label>
          <ScrollArea className="h-40 w-full rounded-md border">
            <div className="p-4 space-y-2">
              {repositories
                .filter(repo => repo.id !== selectedSourceRepo)
                .map(repo => (
                  <div key={repo.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`target-${repo.id}`}
                      checked={selectedTargetRepos.includes(repo.id)}
                      onCheckedChange={(checked) => {
                        setSelectedTargetRepos(prev =>
                          checked
                            ? [...prev, repo.id]
                            : prev.filter(id => id !== repo.id)
                        );
                      }}
                      disabled={isLoading}
                    />
                    <label
                      htmlFor={`target-${repo.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {repo.nickname || repo.url}
                      {repo.is_master && (
                        <Star className="inline h-4 w-4 ml-2 text-red-500" />
                      )}
                    </label>
                  </div>
                ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Push Type</label>
        <Select 
          value={pushType} 
          onValueChange={setPushType}
          disabled={isLoading}
        >
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

      <Button 
        onClick={handlePushRepo} 
        className="w-full"
        disabled={isLoading || !selectedSourceRepo || selectedTargetRepos.length === 0}
      >
        {isLoading ? "Pushing..." : `Push to ${selectedTargetRepos.length} Repositories`}
      </Button>
    </div>
  );
}
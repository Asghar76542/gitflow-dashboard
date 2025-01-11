import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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
import { Input } from "@/components/ui/input";
import { Repository, ConsoleLog, VerificationStatus } from "@/types/repository";
import { RepositoryForm } from "./repository/RepositoryForm";
import { RepositoryPushControls } from "./repository/RepositoryPushControls";
import { RepositoryList } from "./repository/RepositoryList";
import { ConsoleOutput } from "./repository/ConsoleOutput";

export function RepoManager() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [lastAction, setLastAction] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [repoToDelete, setRepoToDelete] = useState<string | null>(null);
  const [editingRepo, setEditingRepo] = useState<Repository | null>(null);
  const { toast } = useToast();

  const [consoleLogs, setConsoleLogs] = useState<ConsoleLog[]>([]);
  const [showConsole, setShowConsole] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus>({ checking: false });

  const addConsoleLog = (message: string, type: 'error' | 'success' | 'info' = 'info') => {
    setConsoleLogs(prev => [...prev, {
      message,
      type,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const transformRepositoryData = (data: any[]): Repository[] => {
    return data.map(repo => ({
      id: repo.id,
      url: repo.url,
      name: repo.name,
      nickname: repo.nickname,
      is_master: repo.is_master,
      last_sync: repo.last_sync,
      status: repo.status,
      last_commit: repo.last_commit,
      last_commit_date: repo.last_commit_date,
      default_branch: repo.default_branch,
      branches: Array.isArray(repo.branches) ? repo.branches : [],
      recent_commits: Array.isArray(repo.recent_commits) ? repo.recent_commits : []
    }));
  };

  useEffect(() => {
    fetchRepositories();
  }, []);

  const fetchRepositories = async () => {
    try {
      const { data, error } = await supabase
        .from('repositories')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const transformedData = transformRepositoryData(data || []);
      setRepositories(transformedData);
    } catch (error) {
      console.error('Error fetching repositories:', error);
      toast({
        title: "Error",
        description: "Failed to fetch repositories",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRepo = async (id: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('repositories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setRepositories(prev => prev.filter(repo => repo.id !== id));
      
      toast({
        title: "Success",
        description: "Repository deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting repository:', error);
      toast({
        title: "Error",
        description: "Failed to delete repository",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setShowDeleteConfirm(false);
      setRepoToDelete(null);
    }
  };

  const handleUpdateLabel = async (id: string, newLabel: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('repositories')
        .update({ nickname: newLabel })
        .eq('id', id);

      if (error) throw error;

      setRepositories(prev => prev.map(repo => 
        repo.id === id ? { ...repo, nickname: newLabel } : repo
      ));
      
      toast({
        title: "Success",
        description: "Repository label updated successfully",
      });
    } catch (error) {
      console.error('Error updating repository label:', error);
      toast({
        title: "Error",
        description: "Failed to update repository label",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setEditingRepo(null);
    }
  };

  const refreshLastCommit = async (id: string) => {
    try {
      setIsLoading(true);
      await supabase.functions.invoke('git-operations', {
        body: {
          type: 'getLastCommit',
          sourceRepoId: id
        }
      });

      await fetchRepositories();
      
      toast({
        title: "Success",
        description: "Repository information updated",
      });
    } catch (error) {
      console.error('Error refreshing repository:', error);
      toast({
        title: "Error",
        description: "Failed to refresh repository information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMaster = async (id: string) => {
    try {
      setIsLoading(true);
      
      // Update all repositories to not be master
      await supabase
        .from('repositories')
        .update({ is_master: false })
        .neq('id', id);

      // Set the selected repository as master
      const { error } = await supabase
        .from('repositories')
        .update({ is_master: true })
        .eq('id', id);

      if (error) throw error;

      await fetchRepositories();
      
      toast({
        title: "Success",
        description: "Master repository updated",
      });
    } catch (error) {
      console.error('Error toggling master repository:', error);
      toast({
        title: "Error",
        description: "Failed to update master repository",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6 space-y-6 bg-secondary/50 backdrop-blur-sm">
      <RepositoryForm onRepositoryAdded={fetchRepositories} />

      <div className="space-y-4 pt-4 border-t border-border/50">
        <RepositoryPushControls
          repositories={repositories}
          onPushComplete={fetchRepositories}
          onVerificationComplete={setVerificationStatus}
          addConsoleLog={addConsoleLog}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
        />

        {verificationStatus.message && (
          <div className={`p-4 rounded-md ${
            verificationStatus.checking ? 'bg-blue-500/10 border border-blue-500/20' :
            verificationStatus.success ? 'bg-green-500/10 border border-green-500/20' :
            'bg-red-500/10 border border-red-500/20'
          }`}>
            <p className="text-sm">
              {verificationStatus.message}
            </p>
          </div>
        )}
      </div>

      {repositories.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-border/50">
          <h3 className="text-lg font-medium flex items-center gap-2">
            <History className="h-5 w-5" />
            Repository History
          </h3>
          <RepositoryList
            repositories={repositories}
            onToggleMaster={toggleMaster}
            onRefresh={refreshLastCommit}
            onEdit={setEditingRepo}
            onDelete={(id) => {
              setRepoToDelete(id);
              setShowDeleteConfirm(true);
            }}
            isLoading={isLoading}
          />
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

      <ConsoleOutput
        showConsole={showConsole}
        onToggleConsole={() => setShowConsole(!showConsole)}
        logs={consoleLogs}
      />

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Repository</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this repository? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowDeleteConfirm(false);
              setRepoToDelete(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => repoToDelete && handleDeleteRepo(repoToDelete)}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!editingRepo} onOpenChange={(open) => !open && setEditingRepo(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Edit Repository Label</AlertDialogTitle>
            <AlertDialogDescription>
              <Input
                value={editingRepo?.nickname || ''}
                onChange={(e) => setEditingRepo(prev => prev ? {...prev, nickname: e.target.value} : null)}
                placeholder="Enter new label"
                className="mt-2"
              />
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setEditingRepo(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => editingRepo && handleUpdateLabel(editingRepo.id, editingRepo.nickname || '')}
            >
              Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
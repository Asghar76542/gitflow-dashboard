import { Repository } from "@/types/repository";
import { Button } from "@/components/ui/button";
import { GitCommit, Star, RefreshCw, Edit2, Trash2, GitBranch, GitMerge } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tag } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RepositoryListProps {
  repositories: Repository[];
  onToggleMaster: (id: string) => void;
  onRefresh: (id: string) => void;
  onEdit: (repo: Repository) => void;
  onDelete: (id: string) => void;
  isLoading: boolean;
}

export function RepositoryList({
  repositories,
  onToggleMaster,
  onRefresh,
  onEdit,
  onDelete,
  isLoading
}: RepositoryListProps) {
  return (
    <div className="space-y-2">
      {repositories.map(repo => (
        <div 
          key={repo.id} 
          className={`flex flex-col p-3 rounded-md transition-colors ${
            repo.is_master ? 'bg-red-500/10 border border-red-500/20' : 'bg-background/50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitCommit className={`h-4 w-4 ${repo.is_master ? 'text-red-500' : 'text-muted-foreground'}`} />
              <span className="text-sm">{repo.url}</span>
              {repo.nickname && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  {repo.nickname}
                </Badge>
              )}
              {repo.is_master ? (
                <Star className="h-4 w-4 text-red-500" />
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleMaster(repo.id)}
                  className="text-xs"
                  disabled={isLoading}
                >
                  Set as Master
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRefresh(repo.id)}
                className="text-xs"
                disabled={isLoading}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Refresh
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(repo)}
                className="text-xs"
                disabled={isLoading}
              >
                <Edit2 className="h-3 w-3 mr-1" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(repo.id)}
                className="text-xs text-destructive"
                disabled={isLoading}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                Delete
              </Button>
            </div>
          </div>

          <div className="mt-4 text-xs text-muted-foreground space-y-2">
            <div className="flex items-center gap-2">
              <GitBranch className="h-3 w-3" />
              Default branch: {repo.default_branch || 'Unknown'}
            </div>
            
            {repo.branches && repo.branches.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {repo.branches.map(branch => (
                  <Badge 
                    key={branch.name}
                    variant={branch.protected ? "destructive" : "secondary"}
                    className="text-xs"
                  >
                    {branch.name}
                    {branch.protected && ' 🔒'}
                  </Badge>
                ))}
              </div>
            )}

            {repo.recent_commits && repo.recent_commits.length > 0 && (
              <ScrollArea className="h-32 w-full rounded-md border border-border/50 p-2">
                <div className="space-y-2">
                  {repo.recent_commits.map((commit, index) => (
                    <div key={commit.sha} className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <GitMerge className="h-3 w-3" />
                        <span className="font-mono">{commit.sha.substring(0, 7)}</span>
                        <span className="text-muted-foreground">
                          {new Date(commit.date).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-muted-foreground pl-5">{commit.message}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}

            <div>Last synced: {repo.last_sync ? new Date(repo.last_sync).toLocaleString() : 'Never'}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
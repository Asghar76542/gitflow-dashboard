export interface Repository {
  id: string;
  url: string;
  name?: string;
  nickname?: string;
  is_master?: boolean;
  last_sync?: string;
  status?: string;
  last_commit?: string;
  last_commit_date?: string;
  default_branch?: string;
  branches?: {
    name: string;
    protected: boolean;
    sha: string;
  }[];
  recent_commits?: {
    sha: string;
    message: string;
    date: string;
    author?: string;
  }[];
}

export interface ConsoleLog {
  message: string;
  type: 'error' | 'success' | 'info';
  timestamp: string;
  data?: any;
}

export interface VerificationStatus {
  checking: boolean;
  success?: boolean;
  message?: string;
  details?: {
    sourceCommit?: string;
    targetCommit?: string;
    syncTime?: string;
  };
}
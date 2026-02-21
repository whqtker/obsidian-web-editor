export interface GitHubFile {
  name: string;
  path: string;
  sha: string;
  size: number;
  type: 'file' | 'dir' | 'symlink' | 'submodule';
  content?: string;
  encoding?: 'base64';
  url: string;
  download_url: string | null;
}

export interface GitHubTreeNode {
  path: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
  mode: string;
}

export interface GitHubTreeResponse {
  sha: string;
  url: string;
  tree: GitHubTreeNode[];
  truncated: boolean;
}

export interface CommitResult {
  commit: {
    sha: string;
    message: string;
    html_url: string;
  };
  content: GitHubFile;
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetAt: Date;
  used: number;
}

export interface Frontmatter {
  title?: string;
  tags?: string[];
  aliases?: string[];
  date?: string;
  [key: string]: unknown;
}

export interface WikiLink {
  raw: string;
  target: string;
  display?: string;
  heading?: string;
}

export interface TreeNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: TreeNode[];
  sha: string;
}

export interface Skill {
  id: string;
  name: string;
  fileCount: number;
  description: string;
}

export interface SkillListItem {
  id: string;
  name: string;
  description: string | null;
  tenant_id: string;
  created_by: string;
}

export interface SkillListResponse {
  data: {
    list: SkillListItem[];
    total: number;
    page: number;
    pages: number;
  };
  status: string;
}

export interface FileNode {
  name: string;
  id: string;
  is_dir: boolean;
  children: FileNode[];
}

export interface FileContentResponse {
  text: string;
  status: string;
}

export interface FileTreeResponse {
  data: FileNode;
  status: string;
}

export const addSkill = async (name: string, template: boolean): Promise<{ status: string }> => {
  const response = await fetch('/console/api/skills/add', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, template }),
  });
  return response.json();
};

export const getSkillList = async (page?: number, limit?: number): Promise<SkillListResponse> => {
  const query = new URLSearchParams();
  if (page) query.append('page', page.toString());
  if (limit) query.append('limit', limit.toString());
  const response = await fetch(`/console/api/skills/list?${query.toString()}`);
  return response.json();
};

export const getFileContent = async (skill_id?: string, file_id?: string): Promise<FileContentResponse> => {
  const query = new URLSearchParams();
  if (skill_id) query.append('skill_id', skill_id);
  if (file_id) query.append('file_id', file_id);
  const response = await fetch(`/console/api/skills/file?${query.toString()}`);
  return response.json();
};

export const updateFileContent = async (skill_id: string, file_id: string, text: string): Promise<{ status: string }> => {
  const response = await fetch('/console/api/skills/file', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ skill_id, file_id, text }),
  });
  return response.json();
};

export const getFileTree = async (skill_id?: string): Promise<FileTreeResponse> => {
  const query = new URLSearchParams();
  if (skill_id) query.append('skill_id', skill_id);
  const response = await fetch(`/console/api/skills/tree?${query.toString()}`);
  return response.json();
};

export const renameNode = async (skill_id: string, tree_id: string, new_name: string): Promise<{ status: string }> => {
  const response = await fetch('/console/api/skills/tree', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ skill_id, tree_id, new_name }),
  });
  return response.json();
};

export const deleteNode = async (skill_id: string, tree_id: string): Promise<{ status: string }> => {
  const query = new URLSearchParams({ skill_id, tree_id });
  const response = await fetch(`/console/api/skills/tree?${query.toString()}`, {
    method: 'DELETE',
  });
  return response.json();
};

export const uploadZip = async (file: File): Promise<{ status: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetch('/console/api/skills/upload/zip', {
    method: 'POST',
    body: formData,
  });
  return response.json();
};

export const createNewNode = async (skill_id: string, parent_id: string, is_dir: boolean, name: string): Promise<{ status: string }> => {
  const response = await fetch('/console/api/skills/tree/new', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ skill_id, parent_id, is_dir, name }),
  });
  return response.json();
};

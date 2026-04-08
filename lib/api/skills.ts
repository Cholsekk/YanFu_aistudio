import { apiService } from '../../services/apiService';

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
  me: boolean;
  available: boolean | string;
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
  return apiService.post('/skills/add', { name, template });
};

export const getSkillList = async (page?: number, limit?: number, only_me?: boolean): Promise<SkillListResponse> => {
  const params: any = {};
  if (page) params.page = page;
  if (limit) params.limit = limit;
  if (only_me !== undefined) params.only_me = only_me;
  return apiService.get('/skills/list', params);
};

export const getFileContent = async (skill_id?: string, file_id?: string): Promise<FileContentResponse> => {
  const params: any = {};
  if (skill_id) params.skill_id = skill_id;
  if (file_id) params.file_id = file_id;
  return apiService.get('/skills/file', params);
};

export const updateFileContent = async (skill_id: string, file_id: string, text: string): Promise<{ status: string }> => {
  return apiService.post('/skills/file', { skill_id, file_id, text });
};

export const getFileTree = async (skill_id?: string): Promise<FileTreeResponse> => {
  const params: any = {};
  if (skill_id) params.skill_id = skill_id;
  return apiService.get('/skills/tree', params);
};

export const renameNode = async (skill_id: string, tree_id: string, new_name: string): Promise<{ status: string }> => {
  return apiService.post('/skills/tree', { skill_id, tree_id, new_name });
};

export const deleteNode = async (skill_id: string, tree_id: string): Promise<{ status: string }> => {
  const query = new URLSearchParams({ skill_id, tree_id }).toString();
  return apiService.del(`/skills/tree?${query}`);
};

export const uploadZip = async (file: File): Promise<{ status: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  return apiService.post('/skills/upload/zip', formData);
};

export const createNewNode = async (skill_id: string, parent_id: string, is_dir: boolean, name: string): Promise<{ status: string }> => {
  return apiService.post('/skills/tree/new', { skill_id, parent_id, is_dir, name });
};

export const useSkill = async (skill_id: string, used: boolean): Promise<{ skill_id: string; used: boolean }> => {
  return apiService.post('/skills/use', { skill_id, used });
};

export const getAvailableSkills = async (): Promise<{ data: SkillListItem[]; status: string }> => {
  return apiService.get('/skill/use');
};

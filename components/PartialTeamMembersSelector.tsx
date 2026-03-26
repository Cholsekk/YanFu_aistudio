import React, { useState, useEffect } from 'react';
import { Select, Input, Checkbox, Avatar, Spin } from 'antd';
import { Search } from 'lucide-react';
import { Role, Department, Member } from '../types';
import { apiService } from '../services/apiService';

interface PartialTeamData {
  roles?: string[];
  departments?: string[];
  members?: string[];
}

interface PartialTeamMembersSelectorProps {
  partialTeamData: PartialTeamData;
  updateKBSettings: (settings: any) => void;
  onMembersLoaded?: (members: Member[], roles: Role[]) => void;
}

export const PartialTeamMembersSelector: React.FC<PartialTeamMembersSelectorProps> = ({ partialTeamData, updateKBSettings, onMembersLoaded }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [rolesRes, deptsRes, membersRes] = await Promise.all([
          apiService.getRoles(),
          apiService.getDepartments(),
          apiService.getMembers()
        ]);
        const fetchedRoles = rolesRes.data || [];
        const fetchedMembers = membersRes.accounts || [];
        setRoles(fetchedRoles);
        setDepartments(deptsRes.data || []);
        setMembers(fetchedMembers);
        if (onMembersLoaded) {
          onMembersLoaded(fetchedMembers, fetchedRoles);
        }
      } catch (error) {
        console.error('Failed to fetch user management data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.real_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Spin spinning={isLoading}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-blue-600 uppercase">角色</label>
            <Select
              mode="multiple"
              className="w-full"
              placeholder="选择角色"
              value={partialTeamData?.roles || []}
              onChange={(v) => updateKBSettings({ 
                partial_team_data: { ...partialTeamData, roles: v } 
              })}
              options={roles.map(r => ({ value: r.role_id, label: r.role_name }))}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-blue-600 uppercase">部门</label>
            <Select
              mode="multiple"
              className="w-full"
              placeholder="选择部门"
              value={partialTeamData?.departments || []}
              onChange={(v) => updateKBSettings({ 
                partial_team_data: { ...partialTeamData, departments: v } 
              })}
              options={departments.map(d => ({ value: d.dept_id, label: d.dept_name }))}
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs font-medium text-blue-600 uppercase">成员</label>
          <Input 
            placeholder="搜索用户" 
            prefix={<Search className="w-4 h-4 text-gray-400" />}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="max-h-60 overflow-y-auto custom-scrollbar border rounded-lg p-2 bg-white">
            {filteredMembers.map(member => {
              // 自动勾选逻辑：如果成员的角色在已选角色列表中，则自动勾选
              // 注意：文档中成员的 role 是名称（如 "admin"），而角色列表中的是 role_id。
              // 我们需要根据 role_id 找到对应的 role_name 进行匹配。
              const selectedRoleNames = roles
                .filter(r => partialTeamData?.roles?.includes(r.role_id))
                .map(r => r.role_name);
              
              const isAutoSelected = selectedRoleNames.includes(member.role);
              // 部门自动勾选逻辑：由于 Member 对象中没有 dept_id，暂时无法实现基于部门的自动勾选。
              // 如果后续接口补充了成员所属部门信息，可以在此扩展。
              
              const isManuallySelected = partialTeamData?.members?.includes(member.id);
              const isSelected = isAutoSelected || isManuallySelected;

              return (
                <div 
                  key={member.id} 
                  className={`flex items-center justify-between p-2 rounded hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    {member.avatar ? (
                      <Avatar size="small" src={member.avatar} />
                    ) : (
                      <Avatar size="small">{member.name[0]}</Avatar>
                    )}
                    <div>
                      <div className="text-sm font-medium">{member.name}</div>
                      <div className="text-xs text-gray-500">{member.email}</div>
                    </div>
                  </div>
                  <Checkbox 
                    checked={isSelected}
                    disabled={isAutoSelected}
                    onChange={(e) => {
                      const newMembers = e.target.checked 
                        ? [...(partialTeamData?.members || []), member.id]
                        : (partialTeamData?.members || []).filter(id => id !== member.id);
                      updateKBSettings({ 
                        partial_team_data: { ...partialTeamData, members: newMembers } 
                      });
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Spin>
  );
};

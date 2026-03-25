import React, { useState } from 'react';
import { Select, Input, Checkbox, Avatar } from 'antd';
import { Search } from 'lucide-react';
import { MOCK_DEPARTMENTS, MOCK_ROLES, MOCK_MEMBERS, PartialTeamData } from '../constants';

interface PartialTeamMembersSelectorProps {
  partialTeamData: PartialTeamData;
  updateKBSettings: (settings: any) => void;
}

export const PartialTeamMembersSelector: React.FC<PartialTeamMembersSelectorProps> = ({ partialTeamData, updateKBSettings }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMembers = MOCK_MEMBERS.filter(m => m.name.includes(searchTerm));

  return (
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
            options={MOCK_ROLES}
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
            options={MOCK_DEPARTMENTS}
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
            const isAutoSelected = (partialTeamData?.roles?.includes(member.role) || 
                                   partialTeamData?.departments?.includes(member.dept));
            const isManuallySelected = partialTeamData?.members?.includes(member.id);
            const isSelected = isAutoSelected || isManuallySelected;

            return (
              <div 
                key={member.id} 
                className={`flex items-center justify-between p-2 rounded hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <Avatar size="small">{member.name[0]}</Avatar>
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
  );
};

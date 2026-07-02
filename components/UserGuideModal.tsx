import React from 'react';
import { Tour, TourProps, ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  subTab?: string;
  primaryColor?: string;
}

const UserGuideModal: React.FC<UserGuideModalProps> = ({ isOpen, onClose, activeTab, subTab, primaryColor }) => {
  const getSteps = (): TourProps['steps'] => {
    switch (activeTab) {
      case 'app-dev':
        return [
          {
            title: '应用类型筛选',
            description: '这是按应用类型进行第一层级筛选的地方。当您创建了众多应用后，可通过点击这些高亮分类按钮，瞬间过滤出所有纯「对话应用」或负责复杂调度的「工作流应用」。',
            target: () => document.querySelector('#tour-filter-search .flex-wrap') as HTMLElement || document.body,
          },
          {
            title: '精准搜索与高级视图控制',
            description: '如果分类过滤还不够，在此区域您可以输入关键词进行应用名搜索、通过高级筛选根据更新时间或名称进行列表排序，甚至自由切换网格与列表两种展现视图，让查找变得极为高效。',
            target: () => document.querySelector('#tour-filter-search .flex.items-center.gap-3:last-child') as HTMLElement || document.body,
          },
          {
            title: '从零新建空白应用',
            description: '一切创造的开端。点击「新建应用」按钮，您可以开启一张空白画布，自由选择大型语言模型、配置对话开场白，打造属于您个人的专属 AI 应用系统。',
            target: () => {
              const buttons = document.querySelectorAll('#tour-create-app button');
              return (buttons[0] as HTMLElement) || document.body;
            },
          },
          {
            title: '应用模板与快捷导入',
            description: '除了从零搭建，平台也提供了捷径。如果您想快速满足某些特定需求场景，可使用「创建定制化应用」套用模板；或者通过「导入应用」上传 JSON 配置文件，一键恢复所有的系统设定和工作流布局。',
            target: () => {
              const buttons = document.querySelectorAll('#tour-create-app button');
              return (buttons[1] as HTMLElement) || document.body;
            },
          },
          {
            title: '深入管理单个应用',
            description: '所有的应用会以直观的卡片形式展现在屏幕中，包括应用类型、简略描述等。点击卡片的任何空白主体部分，系统会带您进入该应用的深度配置面板和实时提示词调试沙箱。',
            target: () => {
              const firstCard = document.querySelector('.tour-app-card');
              return (firstCard as HTMLElement) || document.body;
            },
          },
          {
            title: '应用标签与分类管理',
            description: '在每一张卡片的底部区域，您可以自由地为应用添加、编辑或删除自定义标签。利用多维度的标签系统能够让您的团队更好地组织和聚类大量应用。',
            target: () => {
              const firstCard = document.querySelector('.tour-app-card');
              const tagsArea = firstCard?.querySelector('.tour-app-tags');
              return (tagsArea as HTMLElement || firstCard as HTMLElement) || document.body;
            },
          },
          {
            title: '快捷操作与应用转换',
            description: '每个卡片的右上方有一个「...」小菜单按钮，无需进入应用内部，您即可在这里重命名应用图标和名字、一键克隆应用配置、打包导出 JSON 备份，或是将一个简单的对话应用无缝升级为拥有节点规划的高级工作流应用。',
            target: () => {
              const firstCard = document.querySelector('.tour-app-card');
              const btn = firstCard?.querySelector('button');
              return (btn as HTMLElement || firstCard as HTMLElement) || document.body;
            },
          }
        ];
      case 'tools':
        const currentSubTab = subTab || 'builtin';
        if (currentSubTab === 'mcp') {
          return [
            {
              title: 'MCP服务配置概要',
              description: '此处统一管理和接入外部 MCP 服务，拓展 AI 大模型的能力边界。',
              target: () => document.getElementById('tour-tab-mcp') || null,
            },
            {
              title: '快速搜索服务',
              description: '在此搜索栏输入服务名称或标识符，快速定位已连接的 MCP 服务。',
              target: () => document.querySelector('input[placeholder*="搜索服务名称"]') as HTMLElement || null,
            },
            {
              title: '添加/新建服务',
              description: '点击此处开启引导，配置新的 MCP 服务器端点，实现即插即用的能力扩容。',
              target: () => document.getElementById('tour-add-mcp-service') || null,
            },
            {
              title: '服务管理与详情',
              description: '点击服务卡片上的菜单按钮，可对现有服务配置进行修改、授权更新或移除，查看其同步的工具详情。',
              target: () => document.querySelector('.tour-mcp-menu-btn') as HTMLElement || null,
            }
          ];
        } else if (currentSubTab === 'skills') {
          return [
            {
              title: 'Skills 代码能力管理',
              description: 'Skills 组件用于管理外部代码片段和功能逻辑，作为独立的原子功能插入重用。',
              target: () => document.getElementById('tour-tab-skills') || null,
            },
            {
              title: '新建与管理技能',
              description: '通过顶部工具栏，您可以直接创建空白 Skill 代码，或批量导入现有的 .zip 格式代码库。',
              target: () => document.getElementById('tour-create-skill') || null,
            },
            {
              title: '资源树导航',
              description: '在左侧资源管理器中，点击 Skill 文件夹不仅可以展开查看内部代码文件，还能进行文件的增删改查。',
              target: () => document.querySelector('.flex-grow.overflow-y-auto') as HTMLElement || null,
            },
            {
              title: '实时代码编辑与预览',
              description: '选中 Skill 中的具体文件，即可在此处查看源码内容，或者点击「编辑内容」进行快速的逻辑调整。',
              target: () => document.querySelector('.flex-grow.flex.flex-col.bg-white') as HTMLElement || null,
            }
          ];
        } else if (currentSubTab === 'workflow') {
          return [
            {
              title: '工作流集成',
              description: '这是基于工作流封装好的工具，您可以直接在应用中通过编排界面调用它们。',
              target: () => document.getElementById('tour-tab-workflow') || null,
            },
            {
              title: '工具搜索',
              description: '可以通过输入工具名称搜索，快速定位特定的工作流工具。',
              target: () => document.querySelector('input[name="tool-search"]')?.parentElement as HTMLElement || null,
            },
            {
              title: '工具分类筛选',
              description: '在右侧下拉菜单中，可以根据工具分类标签进一步缩小查找范围。',
              target: () => document.getElementById('tour-tool-filter-btn') || null,
            }
          ];
        } else {
          return [
            {
              title: '内置工具',
              description: '这是系统自带的强大工具，覆盖了联网搜索、数学推导、图像生成等多种常用能力。',
              target: () => document.getElementById('tour-tab-builtin') || null,
            },
            {
              title: '工具搜索筛选',
              description: '可以通过输入工具名称搜索，或点击筛选分类来快速查找您需要的工具。',
              target: () => document.querySelector('input[name="tool-search"]')?.parentElement as HTMLElement || null,
            },
            {
              title: '工具分类筛选',
              description: '在右侧下拉菜单中，可以根据工具分类标签进一步缩小查找范围。',
              target: () => document.getElementById('tour-tool-filter-btn') || null,
            }
          ];
        }
      case 'model':
        return [
          {
            title: '全局默认模型',
            description: '在此处您可以为平台设置统一个默认推荐模型及 Embedding 分析模型，创建新应用时将自动采用此配置。',
            target: () => document.querySelector('.bg-primary-50\\/50') as HTMLElement || document.body,
          },
          {
            title: '配置模型供应商',
            description: '展示所有的受支持的模型供应商。必须首先提供有效的供应商 API Key。',
            target: () => document.querySelector('.bg-white.rounded-xl.shadow-sm') as HTMLElement || document.body,
          },
          {
            title: '激活具体模型',
            description: '点击任意一个供应商，通过表单进行密钥验证，状态变为绿色即代表可用。',
            target: () => document.querySelector('.group.cursor-pointer') as HTMLElement || document.body,
          }
        ];
      default:
        return [];
    }
  };

  const steps = getSteps();

  return (
    <ConfigProvider 
      locale={zhCN}
      theme={{
        token: {
          colorPrimary: primaryColor,
        },
      }}
    >
      <Tour 
        key={isOpen ? 'open' : 'closed'}
        open={isOpen} 
        onClose={onClose} 
        steps={steps}
        type="default"
      />
    </ConfigProvider>
  );
};

export default UserGuideModal;

import React, { useState } from 'react';
import { X, BookOpen, ChevronRight, CheckCircle, Lightbulb, ArrowRight, PlayCircle, Settings, Box, Zap, Clock, Plus, Search, ToggleRight, MoreHorizontal, Database, Key, Check, Code } from 'lucide-react';
import Modal from './Modal';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
}

const UserGuideModal: React.FC<UserGuideModalProps> = ({ isOpen, onClose, activeTab }) => {
  const [currentStep, setCurrentStep] = useState(0);

  // Guide content based on active tab
  const getGuideContent = () => {
    switch (activeTab) {
      case 'app-dev':
        return {
          title: '应用开发指南',
          icon: <Box className="w-6 h-6 text-blue-500" />,
          color: 'blue',
          steps: [
            {
              title: '第一步：创建您的专属应用',
              desc: '在“应用开发”页面，点击右上角的“新建应用”按钮。在弹出的窗口中，选择您需要的应用类型（比如用来聊天的“对话应用”），给它起个好记的名字并写点介绍，点击确定即可完成创建。',
              illustration: (
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex items-center justify-center">
                  {/* AppCard Mockup */}
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 w-72 flex flex-col gap-3">
                    <div className="flex items-start justify-between">
                      <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                        <Box className="w-6 h-6" />
                      </div>
                      <div className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] rounded-md border border-blue-100 font-medium">对话应用</div>
                    </div>
                    <div>
                      <div className="h-4 w-32 bg-gray-800 rounded-full mb-2"></div>
                      <div className="h-2 w-full bg-gray-400 rounded-full mb-1.5"></div>
                      <div className="h-2 w-4/5 bg-gray-400 rounded-full"></div>
                    </div>
                    <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-50">
                      <div className="h-2 w-20 bg-gray-200 rounded-full"></div>
                      <div className="h-2 w-16 bg-gray-200 rounded-full"></div>
                    </div>
                  </div>
                </div>
              )
            },
            {
              title: '第二步：给应用设定“人设”与能力',
              desc: '点击刚刚创建的应用卡片进入详情页。在左侧的“编排”面板中，您可以填写“系统提示词”来设定 AI 的身份和语气，还可以为它添加开场白。如果需要，还能在“工具”一栏点击“+”号，为它装备搜索、查天气等外部能力。右侧可以随时进行对话测试。',
              illustration: (
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex items-center justify-center">
                  {/* AppDetail Orchestrate Mockup */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 w-full max-w-sm flex overflow-hidden h-48">
                    {/* Left Panel: Config */}
                    <div className="w-1/2 bg-white border-r border-gray-100 p-3 flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <Settings className="w-3 h-3 text-gray-400" />
                        <div className="h-2 w-16 bg-gray-800 rounded-full"></div>
                      </div>
                      <div className="h-16 bg-gray-50 border border-gray-100 rounded-lg p-2">
                        <div className="h-1.5 w-full bg-gray-300 rounded-full mb-1.5"></div>
                        <div className="h-1.5 w-5/6 bg-gray-300 rounded-full mb-1.5"></div>
                        <div className="h-1.5 w-4/6 bg-gray-300 rounded-full"></div>
                      </div>
                      <div className="h-6 bg-gray-50 border border-gray-100 rounded-lg flex items-center px-2 justify-between">
                        <div className="h-1.5 w-12 bg-gray-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-white border border-gray-200 rounded-sm"></div>
                      </div>
                    </div>
                    {/* Right Panel: Preview */}
                    <div className="w-1/2 bg-gray-50 p-3 flex flex-col gap-2">
                      <div className="flex items-center justify-between mb-1">
                        <div className="h-2 w-12 bg-gray-400 rounded-full"></div>
                        <PlayCircle className="w-3 h-3 text-blue-500" />
                      </div>
                      <div className="flex gap-2">
                        <div className="w-4 h-4 rounded-full bg-indigo-200 shrink-0"></div>
                        <div className="h-8 w-full bg-white border border-gray-100 rounded-lg rounded-tl-none"></div>
                      </div>
                      <div className="flex gap-2 flex-row-reverse mt-auto">
                        <div className="w-4 h-4 rounded-full bg-blue-200 shrink-0"></div>
                        <div className="h-6 w-16 bg-blue-500 rounded-lg rounded-tr-none"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            },
            {
              title: '第三步：配置变量与知识库',
              desc: '如果需要用户在对话前输入特定信息（如姓名、单号），可以添加“变量”。如果想让 AI 基于您的私有文档回答问题，可以在“知识库”模块中绑定已上传的文档。',
              illustration: (
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex items-center justify-center">
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 w-full max-w-xs flex flex-col gap-4">
                    {/* Variables */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs font-bold text-gray-800">{"{x}"} 变量</div>
                        <Plus className="w-3 h-3 text-gray-400" />
                      </div>
                      <div className="border border-gray-100 rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-2 py-1.5 flex text-[10px] text-gray-500">
                          <div className="flex-1">变量 KEY</div>
                          <div className="flex-1">字段名称</div>
                        </div>
                        <div className="px-2 py-2 flex text-[10px] text-gray-700 border-t border-gray-100">
                          <div className="flex-1"><span className="font-mono bg-gray-100 px-1 rounded">user_name</span></div>
                          <div className="flex-1">用户姓名</div>
                        </div>
                      </div>
                    </div>
                    {/* Knowledge Base */}
                    <div>
                      <div className="text-xs font-bold text-gray-800 mb-2 flex items-center gap-1">知识库</div>
                      <div className="border border-dashed border-gray-300 rounded-lg p-3 flex flex-col items-center justify-center gap-1 bg-gray-50">
                        <Plus className="w-4 h-4 text-gray-400" />
                        <div className="text-[10px] text-gray-500">添加知识库</div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            },
            {
              title: '第四步：发布与集成应用',
              desc: '配置完成后，点击左下角的“发布”按钮。在弹出的菜单中，您可以直接点击蓝色的“发布”更新应用状态，也可以选择“发布到应用市场”供团队使用，或者选择“嵌入网站”获取集成代码。',
              illustration: (
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 flex items-center justify-center">
                  <div className="relative w-full max-w-[200px] flex flex-col items-center mt-20">
                    {/* Popover */}
                    <div className="absolute bottom-full mb-2 w-full bg-white rounded-xl shadow-lg border border-gray-100 p-2 flex flex-col">
                      <div className="px-2 py-1 mb-2">
                        <div className="text-xs font-medium text-gray-800">当前草稿未发布</div>
                        <div className="text-[10px] text-gray-400">自动保存 ·</div>
                      </div>
                      <div className="bg-blue-600 text-white text-xs font-medium py-2 rounded-lg text-center mb-2 shadow-sm">
                        发布
                      </div>
                      <div className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded-md cursor-pointer">
                        <Box className="w-3.5 h-3.5 text-gray-500" />
                        <span className="text-xs text-gray-700">发布到应用市场</span>
                      </div>
                      <div className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-50 rounded-md cursor-pointer">
                        <Code className="w-3.5 h-3.5 text-gray-500" />
                        <span className="text-xs text-gray-700">嵌入网站</span>
                      </div>
                      {/* Triangle pointer */}
                      <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b border-r border-gray-100 rotate-45"></div>
                    </div>
                    {/* Main Publish Button */}
                    <div className="w-full bg-blue-500 text-white text-sm font-medium py-2.5 rounded-xl text-center shadow-sm">
                      发布
                    </div>
                  </div>
                </div>
              )
            }
          ]
        };
      case 'tools':
        return {
          title: '工具拓展指南',
          icon: <Zap className="w-6 h-6 text-orange-500" />,
          color: 'orange',
          steps: [
            {
              title: '什么是工具拓展？',
              desc: '大模型本身只能根据学过的知识回答问题，无法获取最新信息或操作外部系统。通过“工具拓展”，您可以给模型配上“手和眼”，比如让它能搜索网页、查询公司数据库或发送邮件。左侧菜单为您分类展示了各种工具来源。',
              illustration: (
                <div className="bg-orange-50 p-6 rounded-xl border border-orange-100 flex items-center justify-center">
                  {/* ToolExtensions Top Nav & Grid Mockup */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 w-full max-w-sm flex flex-col h-40 overflow-hidden">
                    <div className="flex items-center justify-between p-2 border-b border-gray-100">
                      <div className="flex gap-2">
                        <div className="px-3 py-1 bg-gray-50 text-blue-600 text-[10px] rounded-md font-medium">内置工具</div>
                        <div className="px-3 py-1 text-gray-500 text-[10px]">工作流</div>
                        <div className="px-3 py-1 text-gray-500 text-[10px]">MCP工具</div>
                      </div>
                      <div className="h-6 w-24 bg-gray-50 rounded-md flex items-center px-2">
                        <Search className="w-3 h-3 text-gray-400" />
                      </div>
                    </div>
                    <div className="p-3 grid grid-cols-2 gap-2 overflow-hidden">
                      <div className="bg-white border border-gray-100 rounded-lg p-3 flex flex-col gap-2 shadow-sm">
                        <div className="w-6 h-6 bg-pink-50 rounded-full flex items-center justify-center"><Zap className="w-3 h-3 text-pink-500"/></div>
                        <div className="h-2 w-16 bg-gray-800 rounded-full mt-1"></div>
                        <div className="h-1.5 w-full bg-gray-400 rounded-full"></div>
                      </div>
                      <div className="bg-white border border-gray-100 rounded-lg p-3 flex flex-col gap-2 shadow-sm">
                        <div className="w-6 h-6 bg-blue-50 rounded-full flex items-center justify-center"><Code className="w-3 h-3 text-blue-500"/></div>
                        <div className="h-2 w-20 bg-gray-800 rounded-full mt-1"></div>
                        <div className="h-1.5 w-full bg-gray-400 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            },
            {
              title: '如何接入外部工具？',
              desc: '最简单的方式是接入“MCP 服务”。点击左侧的“MCP 服务”，然后点击“添加服务”。在弹窗中填入服务名称和服务器地址（比如一个提供天气查询的接口地址），点击保存。系统会自动拉取并连接该服务下包含的所有可用工具。',
              illustration: (
                <div className="bg-orange-50 p-6 rounded-xl border border-orange-100 flex items-center justify-center">
                  {/* MCP Service Card Mockup */}
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 w-64 flex flex-col gap-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                          <Database className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="h-3 w-20 bg-gray-800 rounded-full mb-1"></div>
                          <div className="h-2 w-24 bg-gray-400 rounded-full"></div>
                        </div>
                      </div>
                      <MoreHorizontal className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex items-center justify-between pt-3 mt-1 border-t border-gray-50">
                      <div className="flex items-center gap-1 text-[10px] text-gray-500">
                        <Zap className="w-3 h-3" /> 5 个工具
                      </div>
                      <div className="h-2 w-16 bg-gray-300 rounded-full"></div>
                    </div>
                  </div>
                </div>
              )
            },
            {
              title: '把工具装配给应用',
              desc: '工具添加好后，怎么让 AI 用起来呢？请回到“应用开发”页面，点开您的应用，在左侧配置面板找到“工具”选项。点击“+”号，在弹出的工具库中找到您刚添加的工具并勾选。下次和这个应用聊天时，它就会自动在需要的时候使用这个工具了。',
              illustration: (
                <div className="bg-orange-50 p-6 rounded-xl border border-orange-100 flex items-center justify-center">
                  {/* ToolSelectorPopover Mockup */}
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 w-full max-w-xs overflow-hidden">
                    <div className="p-2 border-b border-gray-100">
                      <div className="h-7 bg-gray-50 rounded-md flex items-center px-2 gap-2">
                        <Search className="w-3 h-3 text-gray-400" />
                        <div className="h-1.5 w-20 bg-gray-300 rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex px-2 pt-2 gap-2 border-b border-gray-100">
                      <div className="px-2 py-1 border-b-2 border-orange-500 text-[10px] text-orange-600 font-medium">MCP 服务</div>
                      <div className="px-2 py-1 text-[10px] text-gray-500">自定义</div>
                    </div>
                    <div className="p-2 space-y-1">
                      <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-blue-50 rounded flex items-center justify-center"><Search className="w-3 h-3 text-blue-500"/></div>
                          <div>
                            <div className="h-2 w-16 bg-gray-800 rounded-full mb-1"></div>
                            <div className="h-1.5 w-24 bg-gray-400 rounded-full"></div>
                          </div>
                        </div>
                        <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center"><Check className="w-2.5 h-2.5 text-white"/></div>
                      </div>
                      <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-purple-50 rounded flex items-center justify-center"><Database className="w-3 h-3 text-purple-500"/></div>
                          <div>
                            <div className="h-2 w-20 bg-gray-800 rounded-full mb-1"></div>
                            <div className="h-1.5 w-16 bg-gray-400 rounded-full"></div>
                          </div>
                        </div>
                        <div className="w-4 h-4 border border-gray-300 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            },
            {
              title: '测试工具调用',
              desc: '在应用详情页右侧的“调试与预览”窗口中，您可以像普通用户一样与 AI 对话。如果 AI 需要外部信息，您会看到它自动调用工具的过程和返回结果，方便您验证工具是否配置正确。',
              illustration: (
                <div className="bg-orange-50 p-6 rounded-xl border border-orange-100 flex items-center justify-center">
                  {/* Chat Preview Mockup with Tool Call */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 w-full max-w-xs p-3 flex flex-col gap-3 h-48">
                    <div className="flex gap-2 flex-row-reverse">
                      <div className="w-5 h-5 rounded-full bg-blue-200 shrink-0"></div>
                      <div className="px-3 py-1.5 bg-blue-500 text-white text-[10px] rounded-lg rounded-tr-none">帮我查一下今天的天气</div>
                    </div>
                    <div className="flex gap-2">
                      <div className="w-5 h-5 rounded-full bg-indigo-100 shrink-0 flex items-center justify-center"><Box className="w-3 h-3 text-indigo-500"/></div>
                      <div className="flex flex-col gap-1 w-full">
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 border border-gray-100 rounded-md w-max">
                          <Settings className="w-3 h-3 text-gray-400 animate-spin" />
                          <span className="text-[10px] text-gray-500">调用工具: get_weather</span>
                        </div>
                        <div className="h-8 w-4/5 bg-gray-50 border border-gray-100 rounded-lg rounded-tl-none mt-1"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            }
          ]
        };
      case 'model':
        return {
          title: '模型服务指南',
          icon: <Box className="w-6 h-6 text-purple-500" />,
          color: 'purple',
          steps: [
            {
              title: '认识模型供应商',
              desc: '模型就像是 AI 应用的“大脑”。在“模型服务”页面，您可以看到系统支持的各种大模型供应商（比如 OpenAI、智谱清言等）。要让应用聪明起来，您需要先在这里激活至少一个模型供应商。',
              illustration: (
                <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 flex items-center justify-center">
                  {/* TokenConfigModal Providers List Mockup */}
                  <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 w-full max-w-xs flex flex-col gap-2">
                    {[1, 2].map(i => (
                      <div key={i} className="p-3 rounded-lg border border-gray-100 flex items-center justify-between bg-gray-50/50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white shadow-sm rounded-lg border border-gray-100 flex items-center justify-center">
                            <Box className="w-4 h-4 text-purple-500" />
                          </div>
                          <div>
                            <div className="h-2.5 w-16 bg-gray-800 rounded-full mb-1.5"></div>
                            <div className="flex items-center gap-1">
                              <div className={`w-1.5 h-1.5 rounded-full ${i === 1 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                              <div className="h-1.5 w-8 bg-gray-400 rounded-full"></div>
                            </div>
                          </div>
                        </div>
                        <div className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[10px] font-medium text-gray-600">设置</div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            },
            {
              title: '配置 API Key 激活模型',
              desc: '找到您想使用的模型供应商，点击它右侧的“设置”按钮。在弹出的窗口中，填入您从该供应商官方网站申请到的“API Key”（一串像密码一样的密钥）。填写正确并保存后，状态会变成绿色的“已连接”，代表这个大脑可以工作了。',
              illustration: (
                <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 flex items-center justify-center">
                  {/* API Key Input Mockup */}
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 w-full max-w-xs space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-purple-100 rounded-md flex items-center justify-center"><Key className="w-3 h-3 text-purple-600" /></div>
                      <div className="h-3 w-24 bg-gray-800 rounded-full"></div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-2 w-16 bg-gray-600 rounded-full"></div>
                      <div className="h-9 bg-white border border-purple-200 ring-2 ring-purple-50 rounded-lg flex items-center px-3">
                        <div className="text-xs text-gray-800 font-mono">sk-proj-*******************</div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <div className="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-[10px] font-medium">取消</div>
                      <div className="px-4 py-1.5 bg-purple-600 text-white rounded-lg text-[10px] font-medium">保存配置</div>
                    </div>
                  </div>
                </div>
              )
            },
            {
              title: '设置系统默认“大脑”',
              desc: '在页面上方，您可以设置“系统默认推理模型”（负责思考和回答）和“默认 Embedding 模型”（负责理解文档和知识库）。建议您在这里选好最常用的模型，这样以后新建应用时，系统就会默认使用它们，省去每次都要选的麻烦。',
              illustration: (
                <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 flex items-center justify-center">
                  {/* Default Models Select Mockup */}
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 w-full max-w-xs space-y-4">
                    <div className="h-3 w-24 bg-gray-800 rounded-full mb-2"></div>
                    <div className="space-y-1.5">
                      <div className="h-2 w-20 bg-gray-500 rounded-full"></div>
                      <div className="h-9 bg-white border border-gray-200 rounded-lg flex items-center justify-between px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-gray-100 rounded flex items-center justify-center"><Box className="w-2 h-2 text-gray-500"/></div>
                          <div className="h-2 w-16 bg-gray-800 rounded-full"></div>
                        </div>
                        <ChevronRight className="w-3 h-3 text-gray-400 rotate-90" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-2 w-24 bg-gray-500 rounded-full"></div>
                      <div className="h-9 bg-white border border-gray-200 rounded-lg flex items-center justify-between px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-gray-100 rounded flex items-center justify-center"><Box className="w-2 h-2 text-gray-500"/></div>
                          <div className="h-2 w-20 bg-gray-800 rounded-full"></div>
                        </div>
                        <ChevronRight className="w-3 h-3 text-gray-400 rotate-90" />
                      </div>
                    </div>
                  </div>
                </div>
              )
            },
            {
              title: '为特定应用指定模型',
              desc: '除了系统默认模型，您还可以在每个应用的右上角，单独为该应用选择最适合的推理模型。比如，复杂的任务选择能力更强的模型，简单的任务选择速度更快的模型。',
              illustration: (
                <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 flex items-center justify-center">
                  {/* App Model Selector Mockup */}
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 w-full max-w-xs flex flex-col items-end">
                    <div className="flex items-center gap-2 mb-4 w-full">
                      <div className="h-3 w-16 bg-gray-800 rounded-full"></div>
                      <div className="h-1 w-full bg-gray-100 rounded-full"></div>
                    </div>
                    <div className="h-8 bg-white border border-gray-200 rounded-lg flex items-center justify-between px-2 w-40 shadow-sm">
                      <div className="flex items-center gap-1.5">
                        <div className="w-4 h-4 bg-purple-100 rounded flex items-center justify-center"><Box className="w-2 h-2 text-purple-600"/></div>
                        <div className="text-[10px] font-medium text-gray-700">glm-4.7</div>
                      </div>
                      <ChevronRight className="w-3 h-3 text-gray-400 rotate-90" />
                    </div>
                  </div>
                </div>
              )
            }
          ]
        };
      case 'tasks':
        return {
          title: '定时任务指南',
          icon: <Clock className="w-6 h-6 text-emerald-500" />,
          color: 'emerald',
          steps: [
            {
              title: '为什么要用定时任务？',
              desc: '如果您有一些需要周期性重复的工作，比如“每天早上 9 点总结昨天的新闻并发送报告”，就可以交给“定时任务”来自动完成。点击页面右上角的“新建任务”按钮即可开始设置。',
              illustration: (
                <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100 flex items-center justify-center">
                  {/* ScheduledTasks Table Mockup */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 w-full max-w-sm overflow-hidden flex flex-col">
                    <div className="p-3 border-b border-gray-100 flex justify-between items-center">
                      <div className="h-3 w-16 bg-gray-800 rounded-full"></div>
                      <div className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-[10px] font-medium flex items-center gap-1"><Plus className="w-3 h-3"/> 新建任务</div>
                    </div>
                    <div className="flex bg-gray-50/50 px-4 py-2 border-b border-gray-100">
                      <div className="flex-1 h-2 bg-gray-400 rounded-full"></div>
                      <div className="flex-1 h-2 bg-gray-400 rounded-full mx-2"></div>
                      <div className="w-12 h-2 bg-gray-400 rounded-full"></div>
                    </div>
                    <div className="flex items-center px-4 py-3">
                      <div className="flex-1 flex items-center gap-2">
                        <Clock className="w-3 h-3 text-emerald-500" />
                        <div className="h-2 w-16 bg-gray-800 rounded-full"></div>
                      </div>
                      <div className="flex-1 h-2 w-12 bg-gray-500 rounded-full mx-2"></div>
                      <div className="w-12 flex justify-end"><ToggleRight className="w-5 h-5 text-emerald-500" /></div>
                    </div>
                  </div>
                </div>
              )
            },
            {
              title: '创建定时任务',
              desc: '点击页面右上角的“新建任务”按钮。在弹出的窗口中，填写任务名称和描述，并配置定时规则和目标应用。',
              illustration: (
                <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100 flex items-center justify-center">
                  {/* New Task Form Mockup */}
                  <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 w-full max-w-xs space-y-4">
                    {/* Basic Info */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 text-blue-500">~</div>
                        <div className="text-[10px] font-bold text-gray-800">基本信息</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[8px] text-gray-500"><span className="text-red-500">*</span> 任务名称</div>
                        <div className="h-6 bg-white border border-gray-200 rounded flex items-center px-2">
                          <div className="h-1.5 w-16 bg-gray-300 rounded-full"></div>
                        </div>
                      </div>
                    </div>
                    {/* Timing Config */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-orange-500" />
                        <div className="text-[10px] font-bold text-gray-800">定时配置</div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-[8px] text-gray-500"><span className="text-red-500">*</span> 定时器类型</div>
                        <div className="h-6 bg-white border border-gray-200 rounded flex items-center justify-between px-2">
                          <div className="h-1.5 w-12 bg-gray-600 rounded-full"></div>
                          <ChevronRight className="w-2.5 h-2.5 text-gray-400 rotate-90" />
                        </div>
                      </div>
                    </div>
                    {/* App Config */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full border border-green-500 flex items-center justify-center"><div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div></div>
                        <div className="text-[10px] font-bold text-gray-800">应用配置</div>
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1 space-y-1">
                          <div className="text-[8px] text-gray-500"><span className="text-red-500">*</span> 任务状态</div>
                          <div className="h-6 bg-gray-50 rounded flex items-center p-0.5">
                            <div className="flex-1 h-full bg-white shadow-sm rounded flex items-center justify-center text-[8px] text-blue-600 font-medium">激活</div>
                            <div className="flex-1 h-full rounded flex items-center justify-center text-[8px] text-gray-500">未激活</div>
                          </div>
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="text-[8px] text-gray-500"><span className="text-red-500">*</span> 应用选择</div>
                          <div className="h-6 bg-gray-50 rounded flex items-center p-0.5">
                            <div className="flex-1 h-full bg-white shadow-sm rounded flex items-center justify-center text-[8px] text-blue-600 font-medium">内部应用</div>
                            <div className="flex-1 h-full rounded flex items-center justify-center text-[8px] text-gray-500">外部应用</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            },
            {
              title: '设定执行规则与时间',
              desc: '在“定时配置”区域，您可以选择“定时时间”或“Cron 表达式”。选择“定时时间”后，可以直接在日期选择器中设定具体时间。如果您懂技术，也可以选择“Cron 表达式”来设定更复杂的规则。',
              illustration: (
                <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100 flex items-center justify-center">
                  {/* NewTaskModal Cron Mockup */}
                  <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 w-full max-w-xs space-y-4">
                    <div className="space-y-2">
                      <div className="h-2 w-16 bg-gray-800 rounded-full"></div>
                      <div className="flex gap-2">
                        <div className="flex-1 h-9 bg-white border border-gray-200 rounded-lg flex items-center justify-between px-3">
                          <div className="h-2 w-8 bg-gray-800 rounded-full"></div>
                          <ChevronRight className="w-3 h-3 text-gray-400 rotate-90" />
                        </div>
                        <div className="flex-1 h-9 bg-white border border-gray-200 rounded-lg flex items-center justify-between px-3">
                          <div className="h-2 w-10 bg-gray-800 rounded-full"></div>
                          <ChevronRight className="w-3 h-3 text-gray-400 rotate-90" />
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <div className="h-2 w-24 bg-gray-800 rounded-full"></div>
                        <div className="h-2 w-12 bg-emerald-500 rounded-full"></div>
                      </div>
                      <div className="h-9 bg-gray-50 border border-gray-200 rounded-lg flex items-center px-3">
                        <div className="text-xs text-gray-800 font-mono">0 9 * * *</div>
                      </div>
                      <div className="h-1.5 w-32 bg-gray-400 rounded-full mt-1"></div>
                    </div>
                  </div>
                </div>
              )
            },
            {
              title: '随时掌控任务执行情况',
              desc: '任务创建并开启后，系统就会在后台默默为您工作。您可以点击任务列表中的“查看”按钮，查看它每一次运行的详细情况，包括是否成功、花了多长时间，以及具体的输出结果。如果发现异常，可以随时在这里暂停任务。',
              illustration: (
                <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100 flex items-center justify-center">
                  {/* TaskLogModal Mockup */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 w-full max-w-sm overflow-hidden">
                    <div className="p-3 border-b border-gray-100">
                      <div className="h-3 w-20 bg-gray-800 rounded-full"></div>
                    </div>
                    <div className="flex border-b border-gray-100 bg-gray-50/50 px-4 py-2">
                      <div className="flex-1 h-2 bg-gray-400 rounded-full"></div>
                      <div className="w-16 h-2 bg-gray-400 rounded-full mx-2"></div>
                      <div className="w-12 h-2 bg-gray-400 rounded-full"></div>
                    </div>
                    <div className="divide-y divide-gray-50">
                      {[1, 2].map(i => (
                        <div key={i} className="flex items-center px-4 py-3">
                          <div className="flex-1 h-2 w-20 bg-gray-600 rounded-full"></div>
                          <div className="w-16 flex items-center gap-1.5 mx-2">
                            <CheckCircle className="w-3 h-3 text-green-500" />
                            <div className="h-2 w-6 bg-gray-600 rounded-full"></div>
                          </div>
                          <div className="w-12 h-2 bg-gray-500 rounded-full"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            }
          ]
        };
      default:
        return {
          title: '系统指南',
          icon: <BookOpen className="w-6 h-6 text-primary-500" />,
          color: 'primary',
          steps: [
            {
              title: '欢迎使用',
              desc: '探索平台的各项功能，构建强大的 AI 应用。',
              illustration: <div className="bg-gray-50 p-6 rounded-xl border border-gray-100"></div>
            }
          ]
        };
    }
  };

  const content = getGuideContent();
  const colorClass = 
    content.color === 'blue' ? 'text-blue-600 bg-blue-50 border-blue-100' :
    content.color === 'orange' ? 'text-orange-600 bg-orange-50 border-orange-100' :
    content.color === 'purple' ? 'text-purple-600 bg-purple-50 border-purple-100' :
    content.color === 'emerald' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' :
    'text-primary-600 bg-primary-50 border-primary-100';

  const btnColorClass = 
    content.color === 'blue' ? 'bg-blue-600 hover:bg-blue-700' :
    content.color === 'orange' ? 'bg-orange-500 hover:bg-orange-600' :
    content.color === 'purple' ? 'bg-purple-600 hover:bg-purple-700' :
    content.color === 'emerald' ? 'bg-emerald-600 hover:bg-emerald-700' :
    'bg-primary-600 hover:bg-primary-700';

  // Reset step when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen, activeTab]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="max-w-4xl"
      hideHeader
      bodyClassName="p-0 overflow-hidden rounded-2xl"
    >
      <div className="flex h-[620px] max-h-[85vh]">
        {/* Left Sidebar - Navigation */}
        <div className="w-1/3 bg-gray-50 border-r border-gray-100 p-6 flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
              {content.icon}
            </div>
            <h2 className="text-lg font-bold text-gray-900">{content.title}</h2>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-0">
            {content.steps.map((step, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between group
                  ${currentStep === index 
                    ? 'bg-white shadow-sm border border-gray-200 text-gray-900' 
                    : 'text-gray-500 hover:bg-gray-100/50 border border-transparent'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                    ${currentStep === index ? colorClass : 'bg-gray-200 text-gray-500'}`}>
                    {index + 1}
                  </div>
                  <span className="font-medium text-sm">{step.title}</span>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${currentStep === index ? 'text-gray-400 translate-x-1' : 'text-transparent group-hover:text-gray-300'}`} />
              </button>
            ))}
          </div>

          <div className="mt-auto pt-6 border-t border-gray-200/50">
            <div className="flex items-start gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
              <Lightbulb className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <p className="text-xs text-blue-700 leading-relaxed">
                提示：您可以随时点击右上角的"新手指引"按钮再次查看此教程。
              </p>
            </div>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="w-2/3 p-8 flex flex-col relative overflow-hidden">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex-1 flex flex-col min-h-0 overflow-y-auto custom-scrollbar pr-2">
            <div className="mb-6 shrink-0">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-gray-100 text-gray-600 text-xs font-medium mb-4">
                步骤 {currentStep + 1} / {content.steps.length}
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {content.steps[currentStep].title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {content.steps[currentStep].desc}
              </p>
            </div>

            <div className="flex-1 flex items-center justify-center min-h-0 py-4">
              <div className="w-full">
                {content.steps[currentStep].illustration}
              </div>
            </div>
          </div>

          <div className="mt-4 shrink-0 flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex gap-1">
              {content.steps.map((_, idx) => (
                <div 
                  key={idx} 
                  className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentStep ? `w-6 ${colorClass.split(' ')[1]}` : 'w-1.5 bg-gray-200'}`}
                />
              ))}
            </div>
            
            <div className="flex gap-3">
              {currentStep > 0 && (
                <button 
                  onClick={() => setCurrentStep(prev => prev - 1)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  上一步
                </button>
              )}
              
              {currentStep < content.steps.length - 1 ? (
                <button 
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  className={`px-6 py-2 text-sm font-medium text-white rounded-lg transition-colors shadow-sm ${btnColorClass}`}
                >
                  下一步
                </button>
              ) : (
                <button 
                  onClick={onClose}
                  className={`px-6 py-2 text-sm font-medium text-white rounded-lg transition-colors shadow-sm ${btnColorClass}`}
                >
                  开始使用
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default UserGuideModal;

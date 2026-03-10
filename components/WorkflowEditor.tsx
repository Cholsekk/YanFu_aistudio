import React, { useCallback, useRef, useState, useEffect } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  ConnectionLineType,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  MarkerType,
  Node,
  BackgroundVariant,
  Panel,
  OnSelectionChangeParams,
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getSmoothStepPath,
  useReactFlow,
  ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import WorkflowNode from './WorkflowNode';
import { 
  User, 
  Cpu, 
  Split, 
  LogOut, 
  Image as ImageIcon, 
  FileText, 
  Search, 
  Layers, 
  Repeat,
  Type,
  Plus,
  Play,
  Save,
  MousePointer2,
  PlayCircle,
  Braces,
  X
} from 'lucide-react';
import { NodeMenu } from './NodeMenu';
import { ConfigPanel } from './ConfigPanel';
import { NodeDefinition, ToolDefinition } from '../constants/nodeDefinitions';

export interface WorkflowNodeData {
  label: string;
  icon: React.ReactNode;
  color: string;
  type?: string;
  content?: React.ReactNode;
  status?: 'success' | 'warning' | 'error';
  onDelete?: () => void;
  onAddBefore?: (event?: React.MouseEvent) => void;
  onAddAfter?: (event?: React.MouseEvent) => void;
}

const nodeTypes = {
  workflowNode: WorkflowNode,
};

const DeletableEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) => {
  const { setEdges } = useReactFlow();
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onEdgeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEdges((edges) => edges.filter((edge) => edge.id !== id));
  };

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <button
            className="w-5 h-5 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 shadow-sm transition-all cursor-pointer"
            onClick={onEdgeClick}
            title="删除连线"
          >
            <X size={10} />
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

const edgeTypes = {
  deletableEdge: DeletableEdge,
};

const initialNodes: Node<WorkflowNodeData>[] = [
  {
    id: '1',
    type: 'workflowNode',
    position: { x: 50, y: 200 },
    data: { 
      label: '开始', 
      icon: <PlayCircle className="w-3.5 h-3.5" />, 
      color: 'bg-blue-600',
      content: (
        <div className="flex justify-between items-center text-[10px]">
          <span className="text-blue-600 font-medium">{'{x}'} file</span>
          <span className="text-gray-400">必填</span>
        </div>
      )
    },
  },
  {
    id: '2',
    type: 'workflowNode',
    position: { x: 350, y: 150 },
    data: { 
      label: '条件分支', 
      icon: <Split className="w-3.5 h-3.5" />, 
      color: 'bg-cyan-600',
      content: (
        <div className="space-y-1 text-[9px]">
          <div className="flex items-center gap-1 text-blue-600">
            <span>{'{x}'} file.extensi...</span>
            <span className="text-gray-400">包含 png</span>
          </div>
          <div className="text-right text-blue-400 text-[8px] font-bold">OR</div>
          <div className="flex items-center gap-1 text-blue-600">
            <span>{'{x}'} file.extensi...</span>
            <span className="text-gray-400">包含 jpg</span>
          </div>
          <div className="flex justify-between mt-3 pt-2 border-t border-gray-50">
            <span className="font-bold text-gray-400">IF</span>
            <span className="font-bold text-gray-400">ELSE</span>
          </div>
        </div>
      )
    },
  },
  {
    id: '3',
    type: 'workflowNode',
    position: { x: 650, y: 50 },
    data: { 
      label: '图片OCR识别', 
      icon: <ImageIcon className="w-3.5 h-3.5" />, 
      color: 'bg-indigo-600',
      content: (
        <div className="flex items-center gap-1.5 bg-indigo-50/50 p-1.5 rounded-lg border border-indigo-100/50">
          <div className="w-4 h-4 bg-indigo-600 rounded flex items-center justify-center text-[8px] text-white font-bold shadow-sm">G</div>
          <span className="text-[9px] font-bold text-gray-700">glm-4v-flash</span>
          <span className="text-[7px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded font-bold">CHAT</span>
        </div>
      )
    },
  },
  {
    id: '4',
    type: 'workflowNode',
    position: { x: 650, y: 300 },
    data: { 
      label: '文档提取器', 
      icon: <FileText className="w-3.5 h-3.5" />, 
      color: 'bg-emerald-600',
      content: (
        <div className="space-y-1.5">
          <div className="text-[8px] text-gray-400 uppercase font-bold tracking-tighter">输入变量</div>
          <div className="flex items-center gap-1.5 text-[9px] font-medium">
            <PlayCircle className="w-2.5 h-2.5 text-blue-500" />
            <span className="text-gray-600">开始</span>
            <span className="text-blue-600">{'{x}'} file</span>
          </div>
        </div>
      )
    },
  },
  {
    id: '5',
    type: 'workflowNode',
    position: { x: 950, y: 150 },
    data: { 
      label: '变量聚合器', 
      icon: <Braces className="w-3.5 h-3.5" />, 
      color: 'bg-violet-600',
      content: (
        <div className="space-y-1.5">
          <div className="flex justify-between items-center text-[8px] text-gray-400 font-bold uppercase tracking-tighter">
            <span>变量赋值</span>
            <span>string +</span>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] font-medium">
            <ImageIcon className="w-2.5 h-2.5 text-indigo-400" />
            <span className="text-gray-600">图片OCR识别</span>
            <span className="text-blue-600">{'{x}'} text</span>
          </div>
          <div className="flex items-center gap-1.5 text-[9px] font-medium">
            <FileText className="w-2.5 h-2.5 text-emerald-400" />
            <span className="text-gray-600">文档提取器</span>
            <span className="text-blue-600">{'{x}'} text</span>
          </div>
        </div>
      )
    },
  },
  {
    id: '6',
    type: 'workflowNode',
    position: { x: 1250, y: 150 },
    data: { 
      label: 'LLM', 
      icon: <Cpu className="w-3.5 h-3.5" />, 
      color: 'bg-indigo-600',
      content: (
        <div className="flex items-center gap-1.5 bg-indigo-50/50 p-1.5 rounded-lg border border-indigo-100/50">
          <div className="w-4 h-4 bg-indigo-600 rounded flex items-center justify-center text-[8px] text-white font-bold shadow-sm">D</div>
          <span className="text-[9px] font-bold text-gray-700">DeepSeek-R1</span>
          <span className="text-[7px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded font-bold">CHAT</span>
        </div>
      )
    },
  },
  {
    id: '7',
    type: 'workflowNode',
    position: { x: 1550, y: 150 },
    data: { 
      label: '模板转换', 
      icon: <Layers className="w-3.5 h-3.5" />, 
      color: 'bg-blue-600',
    },
  },
  {
    id: '8',
    type: 'workflowNode',
    position: { x: 1850, y: 150 },
    data: { 
      label: '结束', 
      icon: <LogOut className="w-3.5 h-3.5" />, 
      color: 'bg-orange-500',
      content: (
        <div className="flex items-center gap-1.5 text-[9px] font-medium">
          <Layers className="w-2.5 h-2.5 text-blue-400" />
          <span className="text-gray-600">模板转换</span>
          <span className="text-blue-600">{'{x}'} output</span>
        </div>
      )
    },
  },
];

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', type: 'deletableEdge', animated: true, style: { strokeWidth: 2, stroke: '#94a3b8' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' } },
  { id: 'e2-3', source: '2', target: '3', type: 'deletableEdge', animated: true, style: { strokeWidth: 2, stroke: '#94a3b8' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' } },
  { id: 'e2-4', source: '2', target: '4', type: 'deletableEdge', animated: true, style: { strokeWidth: 2, stroke: '#94a3b8' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' } },
  { id: 'e3-5', source: '3', target: '5', type: 'deletableEdge', animated: true, style: { strokeWidth: 2, stroke: '#94a3b8' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' } },
  { id: 'e4-5', source: '4', target: '5', type: 'deletableEdge', animated: true, style: { strokeWidth: 2, stroke: '#94a3b8' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' } },
  { id: 'e5-6', source: '5', target: '6', type: 'deletableEdge', animated: true, style: { strokeWidth: 2, stroke: '#94a3b8' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' } },
  { id: 'e6-7', source: '6', target: '7', type: 'deletableEdge', animated: true, style: { strokeWidth: 2, stroke: '#94a3b8' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' } },
  { id: 'e7-8', source: '7', target: '8', type: 'deletableEdge', animated: true, style: { strokeWidth: 2, stroke: '#94a3b8' }, markerEnd: { type: MarkerType.ArrowClosed, color: '#94a3b8' } },
];

const nodeWidth = 280;
const nodeHeight = 150;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'LR') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction, ranksep: 100, nodesep: 50, acyclicer: 'greedy' });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  try {
    dagre.layout(dagreGraph);
  } catch (error) {
    console.warn('Dagre layout error (possibly due to cycles):', error);
    return { nodes, edges }; // Return original nodes and edges if layout fails
  }

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: newNodes, edges };
};

const WorkflowEditor: React.FC = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [menuContext, setMenuContext] = useState<{ nodeId: string, direction: 'before' | 'after' } | null>(null);
  const [needsLayout, setNeedsLayout] = useState(true);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (needsLayout) {
      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(nodes, edges);
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
      setNeedsLayout(false);
    }
  }, [needsLayout, nodes, edges, setNodes, setEdges]);

  const deleteNode = useCallback((id: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== id));
    setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
    setSelectedNodeId((prev) => prev === id ? null : prev);
  }, [setNodes, setEdges]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({
      ...params,
      type: 'deletableEdge',
      animated: true,
      style: { strokeWidth: 2, stroke: '#6366f1' },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' }
    }, eds)),
    [setEdges]
  );

  const addNode = useCallback((definition: NodeDefinition | ToolDefinition, position?: { x: number, y: number }) => {
    const id = `node_${Date.now()}`;
    const newNode: Node<WorkflowNodeData> = {
      id,
      type: 'workflowNode',
      position: position || { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        label: definition.label,
        icon: definition.icon,
        color: 'color' in definition ? definition.color : 'bg-purple-600',
        type: 'type' in definition ? definition.type : 'tool',
        onDelete: () => deleteNode(id),
        onAddBefore: (event?: React.MouseEvent) => {
          if (event) {
            event.stopPropagation();
            if (reactFlowWrapper.current) {
              const bounds = reactFlowWrapper.current.getBoundingClientRect();
              setMenuPosition({
                x: event.clientX - bounds.left - 280 - 20,
                y: event.clientY - bounds.top - 150,
              });
            }
          } else {
            setMenuPosition({ x: (position?.x || 0) - 300, y: position?.y || 0 });
          }
          setIsMenuOpen(true);
          setMenuContext({ nodeId: id, direction: 'before' });
        },
        onAddAfter: (event?: React.MouseEvent) => {
          if (event) {
            event.stopPropagation();
            if (reactFlowWrapper.current) {
              const bounds = reactFlowWrapper.current.getBoundingClientRect();
              setMenuPosition({
                x: event.clientX - bounds.left + 20,
                y: event.clientY - bounds.top - 150,
              });
            }
          } else {
            setMenuPosition({ x: (position?.x || 0) + 300, y: position?.y || 0 });
          }
          setIsMenuOpen(true);
          setMenuContext({ nodeId: id, direction: 'after' });
        },
      },
    };

    setNodes((nds) => nds.concat(newNode));

    // Handle automatic connections if context exists
    if (menuContext) {
      const { nodeId, direction } = menuContext;
      if (direction === 'after') {
        setEdges((eds) => {
          const outgoingEdges = eds.filter(e => e.source === nodeId);
          const otherEdges = eds.filter(e => e.source !== nodeId);
          
          const newEdgeToNewNode = {
            id: `e_${nodeId}_${id}`,
            source: nodeId,
            target: id,
            type: 'deletableEdge',
            animated: true,
            style: { strokeWidth: 2, stroke: '#6366f1' },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' }
          };

          const newEdgesFromNewNode = outgoingEdges.map(e => ({
            ...e,
            id: `e_${id}_${e.target}`,
            source: id
          }));

          return [...otherEdges, newEdgeToNewNode, ...newEdgesFromNewNode];
        });
      } else {
        setEdges((eds) => {
          const incomingEdges = eds.filter(e => e.target === nodeId);
          const otherEdges = eds.filter(e => e.target !== nodeId);

          const newEdgeFromNewNode = {
            id: `e_${id}_${nodeId}`,
            source: id,
            target: nodeId,
            type: 'deletableEdge',
            animated: true,
            style: { strokeWidth: 2, stroke: '#6366f1' },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' }
          };

          const newEdgesToNewNode = incomingEdges.map(e => ({
            ...e,
            id: `e_${e.source}_${id}`,
            target: id
          }));

          return [...otherEdges, newEdgeFromNewNode, ...newEdgesToNewNode];
        });
      }
    }

    setIsMenuOpen(false);
    setMenuContext(null);
    setNeedsLayout(true);
  }, [deleteNode, setNodes, setEdges, menuContext]);

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    // Prevent selection if clicking on buttons
    if ((event.target as HTMLElement).closest('button')) {
      return;
    }
    setSelectedNodeId(node.id);
  }, []);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    setIsMenuOpen(false);
    setMenuContext(null);
  }, []);

  const onContextMenu = useCallback((event: React.MouseEvent) => {
    event.preventDefault();
    if (reactFlowWrapper.current) {
      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      setMenuPosition({
        x: event.clientX - bounds.left - 140,
        y: event.clientY - bounds.top - 150,
      });
      setIsMenuOpen(true);
      setMenuContext(null);
      setSelectedNodeId(null); // Close config panel when opening menu
    }
  }, []);

  const updateNodeData = useCallback((id: string, newData: Partial<WorkflowNodeData>) => {
    setNodes((nds) => nds.map((node) => {
      if (node.id === id) {
        return { ...node, data: { ...node.data, ...newData } };
      }
      return node;
    }));
  }, [setNodes]);

  // Initialize nodes with callbacks only once
  const [nodesInitialized, setNodesInitialized] = useState(false);
  useEffect(() => {
    if (!nodesInitialized) {
      setNodes((nds) => nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          onDelete: () => deleteNode(node.id),
          onAddBefore: (event?: React.MouseEvent) => {
            if (event) {
              event.stopPropagation();
              if (reactFlowWrapper.current) {
                const bounds = reactFlowWrapper.current.getBoundingClientRect();
                setMenuPosition({
                  x: event.clientX - bounds.left - 280 - 20,
                  y: event.clientY - bounds.top - 150,
                });
              }
            } else {
              setMenuPosition({ x: node.position.x - 300, y: node.position.y });
            }
            setIsMenuOpen(true);
            setMenuContext({ nodeId: node.id, direction: 'before' });
          },
          onAddAfter: (event?: React.MouseEvent) => {
            if (event) {
              event.stopPropagation();
              if (reactFlowWrapper.current) {
                const bounds = reactFlowWrapper.current.getBoundingClientRect();
                setMenuPosition({
                  x: event.clientX - bounds.left + 20,
                  y: event.clientY - bounds.top - 150,
                });
              }
            } else {
              setMenuPosition({ x: node.position.x + 300, y: node.position.y });
            }
            setIsMenuOpen(true);
            setMenuContext({ nodeId: node.id, direction: 'after' });
          },
        }
      })));
      setNodesInitialized(true);
    }
  }, [nodesInitialized, deleteNode, setNodes]);

  const handleSave = () => {
    console.log('Saving workflow:', { nodes, edges });
    alert('工作流已保存为草稿');
  };

  const handleRun = () => {
    console.log('Running workflow...');
    alert('工作流开始运行...');
  };

  const onNodesDelete = useCallback(
    (deletedNodes: Node[]) => {
      setEdges((eds) =>
        eds.filter((edge) => !deletedNodes.some((node) => node.id === edge.source || node.id === edge.target))
      );
    },
    [setEdges]
  );

  const onEdgesDelete = useCallback(
    (deletedEdges: Edge[]) => {
      setEdges((eds) => eds.filter((edge) => !deletedEdges.some((deleted) => deleted.id === edge.id)));
    },
    [setEdges]
  );

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || null;

  return (
    <ReactFlowProvider>
      <div ref={reactFlowWrapper} className="w-full h-full min-h-[600px] bg-[#fdfdfd] rounded-3xl overflow-hidden border border-gray-200/60 shadow-2xl shadow-indigo-500/5 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodesDelete={onNodesDelete}
          onEdgesDelete={onEdgesDelete}
          onNodeClick={onNodeClick}
          onPaneClick={onPaneClick}
          onContextMenu={onContextMenu}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          connectionLineType={ConnectionLineType.SmoothStep}
          fitView
          deleteKeyCode={['Backspace', 'Delete']}
          defaultEdgeOptions={{
            type: 'deletableEdge',
            style: { strokeWidth: 2, stroke: '#cbd5e1' },
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: '#cbd5e1',
            },
          }}
        >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={1} 
          color="#f1f5f9" 
        />
        <Controls className="!bg-white !border-gray-200 !shadow-lg !rounded-xl overflow-hidden" />
        
        <Panel position="top-left" className="flex flex-col gap-4 !m-6">
          {/* Main Toolbar */}
          <div className="bg-white/80 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-white/40 rounded-2xl p-2 flex items-center gap-2">
            <div className="flex items-center gap-1 pr-2 border-r border-gray-100/50">
              <button className="p-2.5 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-200 group" title="选择模式">
                <MousePointer2 className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center gap-1">
              <button 
                onClick={(e) => {
                  const bounds = reactFlowWrapper.current?.getBoundingClientRect();
                  setMenuPosition({ x: 100, y: 100 });
                  setIsMenuOpen(true);
                }}
                className="p-2 hover:bg-gray-50 rounded-xl text-gray-600 transition-all flex items-center gap-2 group"
                title="添加节点"
              >
                <div className="p-2 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                  <Plus className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="text-left pr-2">
                  <p className="text-[11px] font-bold leading-tight">添加节点</p>
                  <p className="text-[9px] text-gray-400">点击打开菜单</p>
                </div>
              </button>
            </div>
            
            <div className="flex items-center gap-1 pl-2 border-l border-gray-100/50">
              <button 
                onClick={() => setNeedsLayout(true)}
                className="p-2 hover:bg-gray-50 rounded-xl text-gray-600 transition-all flex items-center gap-2 group"
                title="整理布局"
              >
                <div className="p-2 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors">
                  <Layers className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-left pr-2">
                  <p className="text-[11px] font-bold leading-tight">整理布局</p>
                  <p className="text-[9px] text-gray-400">自动对齐节点</p>
                </div>
              </button>
            </div>
          </div>
        </Panel>

        {isMenuOpen && (
          <div 
            className="absolute z-[1000]"
            style={{ left: menuPosition.x, top: menuPosition.y }}
          >
            <NodeMenu 
              onAddNode={(def) => addNode(def, menuPosition)}
              onAddTool={(def) => addNode(def, menuPosition)}
              onClose={() => setIsMenuOpen(false)}
            />
          </div>
        )}

        <Panel position="top-right" className="flex gap-3 !m-6">
          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-3 bg-white/80 backdrop-blur-md border border-white/40 rounded-2xl text-xs font-bold text-gray-700 hover:bg-white transition-all shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
          >
            <Save className="w-4 h-4" />
            保存草稿
          </button>
          <button 
            onClick={handleRun}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 rounded-2xl text-xs font-bold text-white hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200"
          >
            <Play className="w-4 h-4 fill-current" />
            运行工作流
          </button>
        </Panel>
      </ReactFlow>

      <ConfigPanel 
        selectedNode={selectedNode}
        onClose={() => setSelectedNodeId(null)}
        onUpdateNode={updateNodeData}
        onDeleteNode={deleteNode}
      />
    </div>
  </ReactFlowProvider>
);
};

export default WorkflowEditor;

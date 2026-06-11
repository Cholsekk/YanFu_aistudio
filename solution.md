# 最小可行解决方案 (MVS)

## 需求理解
目标是在 `AppConfig` 的发布/更新配置菜单（即包含“更新配置”和“发布到应用市场”的 Popover 模块）中，增加一个 **“恢复”（Restoring Draft）按钮**。
主要受以下条件控：
1. **显示条件**：`publishedAt` 存在且 `isChatApp` 为 `true`（排除 workflow 和 advanced-chat）。
2. **禁用条件**：当本地状态 `published` 为 `true` 时（即刚刚成功点击“更新配置”），必须禁用该按钮，防止重复恢复。
3. **工作逻辑 (前端重置)**：内部无需请求后端 API，在发起”恢复“前弹出二次确认，确认后将所有 React 交互配置表单状态重置为最后截取的“已发布快照”的模样。

## 完善本项目的发布存储逻辑
1. **构建快照与 `published` 状态**：
   通过 `useState` 或 `useRef` 初始化一个快照缓存：`lastPublishedSnapshotRef.current`。
   使用 `const [published, setPublished] = useState(true);` 记录变更。
2. **更新快照时机**：
   - 首次 `fetchAppDetail` 成功拉取且解析完配置到表单之后，记录下配置作为初始快照，并且设置 `published = true`。同时，这里可以查明如果后端接口并没有提供明确的 `published_at` 字段，我们将尝试用 `appDetail.updated_at` 或 `appDetail.created_at` 验证它非全新应用。 
   - 用户点击 “更新配置” ( `onPublish` ) 完成后，同步更新快照，并置 `published = true`。
3. **识别草稿更新使按钮可用**：
   通过 `useEffect` 侦听界面的各表单内容核心依赖（如 `models`, `prompt`, `variables`, `knowledgeBases` 等），利用类似现存项目结构中 `getConfigString()` 函数返回的结构哈希/字符串，对比当前的改动，如果不一致则置 `published = false`，从而激活恢复按钮。

## 代码修改计划 (仅限 /components/AppConfig.tsx)
1. **定义相关状态变量**：
   ```tsx
   const [published, setPublished] = useState(true);
   const lastPublishedSnapshotRef = useRef<any>(null); // 保存解析后的初始配置
   const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);
   ```

2. **识别是否展示该按钮**:
   增加以下判断值，并在发布 Popover 下的 “更新配置” 下方追加按钮：
   ```tsx
   const isChatApp = appMode === 'chat' || appMode === 'agent' || appMode === 'completion';
   // 这里兼容处理如果后端没有特定的 published_at 但已有 appDetail.id，说明至少创建了
   const hasPublishedAt = appDetail?.published_at || appDetail?.created_at || false;
   ```

3. **重写/补齐恢复逻辑 (`handleRestore`)**:
   撰写一个由二次确认弹层触发调用的核心重置函数：
   ```tsx
   const handleRestore = () => {
     if (!lastPublishedSnapshotRef.current) return;
     const config = lastPublishedSnapshotRef.current;
     // 根据被缓存的 config 内容，统一进行 setPrompt(config.pre_prompt)，setModels，setVariables.. 等等恢复界面的动作
     setPublished(true);
     setIsRestoreModalOpen(false);
     message.success('已恢复为上一次发布状态');
   }
   ```

4. **处理发布后的同步**:
   在 `onPublish` 函数内部成功后：
   ```tsx
   // ... 原存逻辑
   setPublished(true);
   lastPublishedSnapshotRef.current = /* 当前界面的所有快照提取, 如: 提取 getConfig() 或基于 Detail 反拼 */; 
   ```

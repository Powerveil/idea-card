export interface ChangeLogEntry {
  id: string;
  date: string;       // e.g., "2025-12-07 14:30"
  content: string;    // e.g., "Added changelog page"
  category: 'Feature' | 'Fix' | 'Style' | 'Refactor' | 'Docs' | 'Other';
  version?: string;   // Optional version tag e.g. "v2.1.0"
  author?: string;
}

export const changelogs: ChangeLogEntry[] = [
  {
    id: '10fe04c',
    date: '2025-12-07 02:30',
    content: '优化 AI 分析功能：增加实时流式响应、Markdown 渲染支持以及 UI 改进',
    category: 'Feature',
    author: 'Powerveil'
  },
  {
    id: 'e9cf9e2',
    date: '2025-12-04 22:56',
    content: '新增 AI 分析功能：支持数据持久化、Markdown 格式支持以及界面优化',
    category: 'Feature',
    author: 'Powerveil'
  },
  {
    id: 'e70c87b',
    date: '2025-12-02 23:36',
    content: '修复卡片详情弹窗关闭后重新打开状态未重置的问题',
    category: 'Fix',
    author: 'Powerveil'
  },
  {
    id: '5cd6c2e',
    date: '2025-12-02 23:29',
    content: '修复模态框关闭状态重置问题，并统一 Vditor 工具栏样式',
    category: 'Fix',
    author: 'Powerveil'
  },
  {
    id: '05f3a7a',
    date: '2025-12-02 23:25',
    content: '使用悬浮操作按钮 (FAB) 替换原有的添加按钮，提升交互体验',
    category: 'Feature',
    author: 'Powerveil'
  },
  {
    id: 'db278dd',
    date: '2025-12-02 23:21',
    content: '修复卡片操作按钮布局，解决 Vditor 工具栏遮挡问题',
    category: 'Fix',
    author: 'Powerveil'
  },
  {
    id: 'bba5fdf',
    date: '2025-12-02 23:16',
    content: '将新建想法表单移至大尺寸模态框中，优化编辑体验',
    category: 'Feature',
    author: 'Powerveil'
  },
  {
    id: 'e62e9f6',
    date: '2025-12-01 23:04',
    content: '实现个人习惯追踪与灵感数据分析功能',
    category: 'Feature',
    author: 'Powerveil'
  },
  {
    id: '2df2cfb',
    date: '2025-11-30 15:29',
    content: '实现高级导入功能：支持冲突解决策略及本地文件持久化',
    category: 'Feature',
    author: 'Powerveil'
  },
  {
    id: 'bdf4b18',
    date: '2025-11-30 14:58',
    content: '实现数据导出与导入功能 (JSON 备份)',
    category: 'Feature',
    author: 'Powerveil'
  },
  {
    id: 'ebc72f2',
    date: '2025-11-30 02:40',
    content: '文档国际化：将所有英文文档翻译为中文',
    category: 'Docs',
    author: 'Powerveil'
  },
  {
    id: 'a60022e',
    date: '2025-11-30 02:30',
    content: '修复 Markdown 解析问题（列表、标题、中文字符），并优化布局',
    category: 'Fix',
    author: 'Powerveil'
  },
  {
    id: '75ac08a',
    date: '2025-11-30 00:30',
    content: '项目初版发布：Idea Card Manager Demo (Vue 3 + Vite)',
    category: 'Feature',
    version: 'v1.0.0',
    author: 'Powerveil'
  },
  {
    id: 'bb99ec3',
    date: '2025-11-30 00:28',
    content: '添加 .gitignore 配置文件',
    category: 'Other',
    author: 'Powerveil'
  }
];

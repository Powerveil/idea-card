# 设计文档：灵感卡片管理器 (Idea Card Manager)

## 1. 架构
- **单体单文件**: `index.html`
    - `<head>`: Meta 标签, `<style>` 块。
    - `<body>`: 语义化 HTML 结构。
    - `<script>`: 位于 body 末尾的逻辑。

## 2. UI 布局
- **容器**: `max-width: 1200px`, 居中。
- **头部**:
    - 标题: "Idea Cards"
    - 统计: "总计: X | 收藏: Y"
- **控制栏**:
    - 搜索输入框。
    - 过滤下拉菜单 (颜色)。
    - 过滤下拉菜单 (标签 - 动态)。
- **内容区域**:
    - **侧边栏 / 顶部区域 (表单)**:
        - 标题输入框。
        - 内容文本域。
        - 标签输入框 (回车添加)。
        - 调色板选择。
        - "添加卡片" 按钮。
    - **网格区域 (列表)**:
        - 网格布局 (`display: grid`)。
        - 响应式列数: 1 (移动端) -> 2 (平板) -> 3/4 (桌面端)。
- **卡片组件**:
    - 头部: 标题 + 日期。
    - 主体: 截断的内容 (渲染后的 MD)。
    - 底部: 标签, 操作 (编辑, 收藏, 删除)。

## 3. 数据模型
```javascript
interface Idea {
    id: string; // UUID 或 Date.now()
    title: string;
    content: string;
    tags: string[];
    color: string; // 十六进制或类名
    createdAt: number; // 时间戳
    updatedAt: number;
    isFavorite: boolean;
}
```

## 4. 组件交互
- **EventManager**:
    - `submit` -> `addCard()`
    - `input` (搜索) -> `renderCards()`
    - `click` (删除) -> `confirm` -> `deleteCard()`
- **StorageManager**:
    - `localStorage` 的封装。
    - 方法: `getIdeas()`, `saveIdeas(ideas)`。

## 5. CSS 策略
- 使用 CSS 变量定义颜色和间距。
- 使用 Flexbox 和 Grid 进行布局。
- 响应式媒体查询 (`@media (max-width: 768px)`)。

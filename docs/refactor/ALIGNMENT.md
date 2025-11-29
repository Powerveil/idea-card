# 对齐文档：灵感卡片管理器重构

## 1. 项目背景
- **目标**：将现有的单文件 HTML 应用重构为现代 Vue 3 + Vite 应用程序。
- **约束**：
    - 打包大小 < 50KB (gzip)。
    - 性能：FCP < 1s，Lighthouse > 90+。
    - 技术栈：Vue 3 (组合式 API), Vite, Pinia。
    - 无重型 UI 框架。

## 2. 需求
- **技术栈**：
    - **核心**：Vue 3 + TypeScript。
    - **构建**：Vite。
    - **状态**：Pinia。
    - **路由**：Vue Router (用于代码分割演示)。
    - **CSS**：Scoped CSS / CSS 变量 (从旧版迁移)。
- **性能策略**：
    - **代码分割**：基于路由 (例如 `/` vs `/stats`)。
    - **压缩**：构建时 Gzip/Brotli。
    - **监控**：`web-vitals` 报告。
    - **App Shell**：在数据加载前立即渲染结构。

## 3. 架构决策
- **SSR/SSG**：鉴于数据在 `localStorage` 中，“真正的” SSR/SSG 仅限于 App Shell。我们将使用高度优化的 Vite SPA 构建。我们将确保“App Shell”（头部、网格布局骨架）立即渲染。
- **PWA**：将包含 `vite-plugin-pwa` 以获得离线能力和可安装性。

## 4. 迁移计划
- **阶段 1**：搭建 Vite + Vue 结构。
- **阶段 2**：将 CSS 变量移植到全局样式。
- **阶段 3**：将 `localStorage` 逻辑移植到 Pinia Store (`useIdeaStore`)。
- **阶段 4**：将 HTML 结构移植到组件 (`Card.vue`, `Form.vue`)。
- **阶段 5**：优化和测量。

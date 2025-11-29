# 构建与部署指南

## 1. 前置条件
- Node.js >= 18.0.0
- npm 或 pnpm

## 2. 安装
```bash
npm install
```

## 3. 开发
```bash
npm run dev
```
在 `http://localhost:5173` 本地运行。

## 4. 生产构建
```bash
npm run build
```
- **输出**: `dist/` 目录。
- **产物**:
    - `index.html`: 入口点。
    - `assets/*.js`: 打包后的 JavaScript (带哈希)。
    - `assets/*.css`: 提取的 CSS。
    - `*.gz`: 预压缩版本。

## 5. 预览生产构建
```bash
npm run preview
```

## 6. 优化配置 (`vite.config.ts`)
- **SplitChunks**: 第三方代码 (Vue, Pinia 等) 被拆分到 `vendor.js` 以利用浏览器缓存。
- **Minification**: 使用 Terser 删除 console 日志和 debugger 语句。
- **PWA**: `vite-plugin-pwa` 生成 `manifest.webmanifest` 和 `sw.js`。
- **Compression**: `vite-plugin-compression` 生成 Gzip 资源。

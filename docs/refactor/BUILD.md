# BUILD & DEPLOYMENT GUIDE

## 1. Prerequisites
- Node.js >= 18.0.0
- npm or pnpm

## 2. Installation
```bash
npm install
```

## 3. Development
```bash
npm run dev
```
Runs locally at `http://localhost:5173`.

## 4. Production Build
```bash
npm run build
```
- **Output**: `dist/` directory.
- **Artifacts**:
    - `index.html`: Entry point.
    - `assets/*.js`: Bundled JavaScript (hashed).
    - `assets/*.css`: Extracted CSS.
    - `*.gz`: Pre-compressed versions.

## 5. Preview Production Build
```bash
npm run preview
```

## 6. Optimization Configuration (`vite.config.ts`)
- **SplitChunks**: Vendor code (Vue, Pinia, etc.) is split into `vendor.js` to leverage browser caching.
- **Minification**: Terser is used to drop console logs and debugger statements.
- **PWA**: `vite-plugin-pwa` generates `manifest.webmanifest` and `sw.js`.
- **Compression**: `vite-plugin-compression` generates Gzip assets.

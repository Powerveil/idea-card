# Idea Card Manager Upgrade Guide: Native to Element Plus

This document outlines the changes made to migrate the UI framework from native HTML/CSS to Element Plus.

## 1. Overview

The project has been refactored to use **Element Plus** as the primary UI library. This provides a more consistent look and feel, better accessibility, and faster development for future features.

### Key Changes
- **Framework**: `element-plus` added.
- **Icons**: `@element-plus/icons-vue` added.
- **Styling**: SCSS integration with Element Plus theme customization.
- **Components**: All custom components refactored to use Element Plus counterparts.

## 2. Dependency Changes

### Added
- `element-plus`: ^2.x
- `@element-plus/icons-vue`: ^2.x
- `sass`: (Dev) For custom theming.
- `unplugin-vue-components`: (Dev) Auto-import components.
- `unplugin-auto-import`: (Dev) Auto-import APIs.

### Configuration
`vite.config.ts` has been updated to include auto-import plugins and SCSS preprocessor options.

```typescript
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// ...
plugins: [
  AutoImport({ resolvers: [ElementPlusResolver()] }),
  Components({ resolvers: [ElementPlusResolver({ importStyle: 'sass' })] }),
],
css: {
  preprocessorOptions: {
    scss: {
      additionalData: `@use "@/styles/element/index.scss" as *;`,
    },
  },
}
```

## 3. Component Mappings

| Original | Refactored | Description |
| :--- | :--- | :--- |
| `div.container` | `el-container` | Main layout container |
| `button` | `el-button` | Standardized buttons with icons |
| `input`, `textarea` | `el-input` | Enhanced inputs |
| `select` | `el-select` | Enhanced dropdowns |
| `modal-overlay` | `el-dialog` | Standardized modal dialogs |
| `div.card` | `el-card` | Content cards |
| Custom Timeline | `el-timeline` | Changelog view |
| Progress bars | `el-progress` | Stats view |

## 4. Theme Customization

The theme is customized in `src/styles/element/index.scss`.
We preserved the original color palette:
- **Primary**: `#4a90e2`
- **Success**: `#2ecc71`
- **Warning**: `#f1c40f`
- **Danger**: `#e74c3c`

## 5. Development Guidelines

### Using Icons
Icons are now imported from `@element-plus/icons-vue`.
```typescript
import { Edit, Delete } from '@element-plus/icons-vue'
```
Usage in template:
```html
<el-button :icon="Edit" />
```

### Forms
Use `el-form` for all data entry. Ensure to use `el-form-item` for proper labeling and validation layout.

### Responsiveness
Element Plus provides a grid system (`el-row`, `el-col`) which is used in `IdeaForm` and `InsightStats`.
For global layout, `el-container` is used.

## 6. Verification Checklist

- [x] Application builds successfully.
- [x] Home page renders with new layout.
- [x] Filtering works (Search, Color, Tag).
- [x] Adding a new idea works (Modal + Form).
- [x] Editing an idea works.
- [x] Deleting an idea works (with confirmation dialog).
- [x] Import/Export functions work.
- [x] Stats view renders correctly.
- [x] Changelog view renders correctly.

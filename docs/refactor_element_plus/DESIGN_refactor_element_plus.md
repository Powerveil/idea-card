# DESIGN: Refactor UI to Element Plus

## 1. System Architecture

### 1.1 Component Mapping

| Existing Component | Element Plus Component | Notes |
| ------------------ | ---------------------- | ----- |
| `App.vue` (Layout) | `el-config-provider`, `el-container`, `el-main` | Global config (locale, size) |
| `HomeView.vue` | `el-container` | Main layout |
| `FilterBar.vue` | `el-row`, `el-col`, `el-input`, `el-select`, `el-button` | Search and filter bar |
| `IdeaCard.vue` | `el-card`, `el-tag`, `el-button` | Displaying individual ideas |
| `IdeaDetailModal.vue`| `el-dialog` | Viewing details |
| `IdeaForm.vue` | `el-form`, `el-form-item`, `el-input`, `el-select`, `el-date-picker` | Create/Edit form |
| `ImportModal.vue` | `el-dialog`, `el-upload` (or keep native file input if simpler) | Import functionality |
| `InsightStats.vue` | `el-row`, `el-col`, `el-statistic`, `el-card` | Dashboard stats |

### 1.2 Theme Design

We will match the existing color palette:
- Primary: `#4a90e2`
- Success: `#2ecc71`
- Warning: `#f1c40f`
- Danger: `#e74c3c`

Implementation:
- Use SCSS to override Element Plus variables.
- Create `src/styles/element/index.scss` for overrides.

## 2. Dependencies

- `element-plus`
- `@element-plus/icons-vue`
- `sass` (for custom theme)
- `unplugin-vue-components` (auto import)
- `unplugin-auto-import` (auto import)

## 3. Implementation Steps

1.  **Setup**: Install dependencies and configure `vite.config.ts`.
2.  **Theming**: Create SCSS variables to match current design.
3.  **Refactor Components**:
    - `InsightStats.vue` (Low complexity)
    - `FilterBar.vue` (Medium complexity)
    - `IdeaCard.vue` (Medium complexity)
    - `IdeaDetailModal.vue` (Medium complexity)
    - `IdeaForm.vue` (High complexity - Form validation)
    - `ImportModal.vue` (Low complexity)
    - `HomeView.vue` & `App.vue` (Layout)
4.  **Verification**: Test all flows.

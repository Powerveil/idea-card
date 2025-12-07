# TASK: Refactor UI to Element Plus

## 1. Sub-tasks

### Task 1: Environment Setup
- **Input**: `package.json`, `vite.config.ts`
- **Action**: 
  - Install `element-plus`, icons, sass, and auto-import plugins.
  - Configure `vite.config.ts` for auto-import.
  - Create `src/styles/element/index.scss` with theme overrides.
- **Output**: Dependencies installed, build config updated.

### Task 2: Refactor Layout & Shared Components
- **Input**: `App.vue`, `HomeView.vue`, `InsightStats.vue`
- **Action**:
  - Update `App.vue` to use `el-config-provider`.
  - Refactor `HomeView.vue` layout.
  - Refactor `InsightStats.vue` to use `el-statistic` and `el-card`.
- **Output**: Main layout and stats using Element Plus.

### Task 3: Refactor Core Interaction Components
- **Input**: `FilterBar.vue`, `IdeaCard.vue`
- **Action**:
  - Refactor `FilterBar` to use `el-input`, `el-select`.
  - Refactor `IdeaCard` to use `el-card`, `el-tag`, buttons with icons.
- **Output**: List view looking correct with Element Plus.

### Task 4: Refactor Forms and Dialogs
- **Input**: `IdeaForm.vue`, `IdeaDetailModal.vue`, `ImportModal.vue`
- **Action**:
  - Refactor `IdeaForm` to use `el-form` with validation.
  - Refactor Modals to `el-dialog`.
  - Ensure Vditor works within `el-form`.
- **Output**: CRUD and Import functionality restored.

### Task 5: Cleanup and Verification
- **Input**: `style.css`
- **Action**:
  - Remove unused styles from `style.css`.
  - Verify all functionalities.
  - Ensure responsive design.
- **Output**: Clean codebase, fully functional app.

### Task 6: Documentation
- **Input**: All changes
- **Action**: Create `UPGRADE_GUIDE.md` as requested.
- **Output**: Detailed upgrade documentation.

## 2. Dependency Graph
Task 1 -> Task 2 -> Task 3 -> Task 4 -> Task 5 -> Task 6

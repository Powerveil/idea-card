# ALIGNMENT: Refactor UI to Element Plus

## 1. Project Context Analysis

### 1.1 Current Architecture
- **Framework**: Vue 3 (Composition API)
- **State Management**: Pinia
- **Routing**: Vue Router
- **Build Tool**: Vite
- **Language**: TypeScript
- **UI Framework**: Custom CSS (Native) + Vditor
- **Styling**: CSS Variables in `style.css`

### 1.2 Existing Components
- **Views**: `HomeView.vue`, `ChangelogView.vue`
- **Components**:
  - `FilterBar.vue` (Filtering and sorting)
  - `IdeaCard.vue` (Card display)
  - `IdeaDetailModal.vue` (Modal dialog)
  - `IdeaForm.vue` (Form for creating/editing)
  - `ImportModal.vue` (File import)
  - `InsightStats.vue` (Statistics display)

### 1.3 Dependencies
- Core: `vue`, `pinia`, `vue-router`
- Utilities: `vditor`, `web-vitals`
- Dev: `typescript`, `vite`, `vue-tsc`

## 2. Requirements Understanding

### 2.1 Core Goal
Refactor the entire UI from native implementation to `element-plus` framework while maintaining existing functionality and user experience.

### 2.2 Scope
- **Installation**: Add `element-plus` and configure it (including auto-import).
- **Refactoring**: Rewrite all existing components to use `element-plus` components.
- **Styling**: Replace custom CSS with Element Plus theming and utilities.
- **Responsiveness**: Ensure the layout works on different screen sizes.
- **Documentation**: Create a comprehensive upgrade document.

### 2.3 User Request Specifics
- Dedicated upgrade document required.
- Maintain consistency in UX.
- Follow Element Plus best practices.
- Ensure performance and code quality.

## 3. Ambiguities and Decisions

### 3.1 Styling Strategy
- **Decision**: Use Element Plus SCSS variables for theming to match existing color palette (`--primary-color`, etc.).
- **Decision**: Use `unplugin-vue-components` and `unplugin-auto-import` for efficient tree-shaking and developer experience.

### 3.2 Icon System
- **Assumption**: Current project might be using SVGs or text. Element Plus uses `@element-plus/icons-vue`.
- **Decision**: Migrate to `@element-plus/icons-vue`.

### 3.3 Vditor Integration
- **Decision**: Vditor is a specialized markdown editor. It should be kept but wrapped or styled to blend in with Element Plus forms.

## 4. Consensus

### 4.1 Acceptance Criteria
- All `src/components` and `src/views` are refactored to use Element Plus components (e.g., `el-button`, `el-dialog`, `el-form`, `el-card`).
- `style.css` is significantly reduced or replaced by Element Plus theme customization.
- Application builds without errors.
- Functionality (CRUD, filtering, import) works as before.
- Responsive design is preserved/improved.
- Upgrade document is created.

### 4.2 Tech Stack
- `element-plus`
- `@element-plus/icons-vue`
- `unplugin-vue-components`
- `unplugin-auto-import`
- `sass` (for theme customization)

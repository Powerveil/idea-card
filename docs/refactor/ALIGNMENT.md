# ALIGNMENT: Idea Card Manager Refactor

## 1. Project Context
- **Goal**: Refactor existing single-file HTML app to a modern Vue 3 + Vite application.
- **Constraints**:
    - Bundle size < 50KB (gzip).
    - Performance: FCP < 1s, Lighthouse > 90+.
    - Stack: Vue 3 (Composition API), Vite, Pinia.
    - No heavy UI frameworks.

## 2. Requirements
- **Tech Stack**:
    - **Core**: Vue 3 + TypeScript.
    - **Build**: Vite.
    - **State**: Pinia.
    - **Router**: Vue Router (for code splitting demonstration).
    - **CSS**: Scoped CSS / CSS Variables (migrated from legacy).
- **Performance Strategy**:
    - **Code Splitting**: Route-based (e.g., `/` vs `/stats`).
    - **Compression**: Gzip/Brotli at build time.
    - **Monitoring**: `web-vitals` reporting.
    - **App Shell**: Immediate render of structure before data load.

## 3. Architecture Decision
- **SSR/SSG**: Given data is in `localStorage`, "True" SSR/SSG is limited to the App Shell. We will use Vite's SPA build which is highly optimized. We will ensure the "App Shell" (Header, Grid Layout skeleton) is rendered immediately.
- **PWA**: Will include `vite-plugin-pwa` for offline capability and installability.

## 4. Migration Plan
- **Phase 1**: Setup Vite + Vue structure.
- **Phase 2**: Port CSS variables to global styles.
- **Phase 3**: Port `localStorage` logic to Pinia Store (`useIdeaStore`).
- **Phase 4**: Port HTML structure to Components (`Card.vue`, `Form.vue`).
- **Phase 5**: Optimize and measure.

# DESIGN_changelog

## 1. Architecture Design

### 1.1 Overall Architecture
- **Data Layer**: Static data file `src/data/changelog.ts` storing the log entries.
- **View Layer**: New view component `src/views/ChangelogView.vue`.
- **Routing**: Update `src/main.ts` to add `/changelog` route.
- **Navigation**: Add a link in the main application UI (likely in `App.vue` header or sidebar, or `HomeView.vue`).

### 1.2 Data Flow
`src/data/changelog.ts` -> `ChangelogView.vue` (renders list)

## 2. Module Design

### 2.1 Data Model (`src/data/changelog.ts`)
```typescript
export interface ChangeLogEntry {
  id: number;
  date: string;       // e.g., "2025-12-07 14:30"
  content: string;    // e.g., "Added changelog page"
  category: 'Feature' | 'Fix' | 'Style' | 'Refactor' | 'Docs' | 'Other';
  version?: string;   // Optional version tag e.g. "v1.1.0"
}

export const changelogs: ChangeLogEntry[] = [
  // ... data
]
```

### 2.2 Component Design (`src/views/ChangelogView.vue`)
- **Layout**: Centered container with max-width.
- **Visual Style**:
  - **Timeline**: A vertical line connecting entries.
  - **Entry**:
    - **Time**: Displayed on the side or top of the card.
    - **Card**: Contains the content and category badge.
    - **Badge**: Color-coded based on category (Feature=Primary/Green, Fix=Red, etc.).
- **Interactions**: Scrollable list.

### 2.3 Routing
- Path: `/changelog`
- Component: `() => import('./views/ChangelogView.vue')` (Lazy load)

## 3. Interface Specifications
- **Data Source**: The `changelogs` array will serve as the single source of truth.

## 4. Visuals (Conceptual)
```
[ Back Button ]  **Update Log**

   |
O--|-- [ 2025-12-07 10:00 ] ----------------------
   |   [ Badge: Feature ]
   |   **Added Dark Mode**
   |   Implemented system-wide dark mode support.
   |
O--|-- [ 2025-12-06 15:30 ] ----------------------
   |   [ Badge: Fix ]
   |   **Fixed Save Bug**
   |   Resolved issue where data wasn't persisting.
   |
```

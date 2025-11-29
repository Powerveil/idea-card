# DESIGN: Idea Card Manager

## 1. Architecture
- **Monolithic Single File**: `index.html`
    - `<head>`: Meta tags, `<style>` block.
    - `<body>`: Semantic HTML structure.
    - `<script>`: Logic at the end of body.

## 2. UI Layout
- **Container**: `max-width: 1200px`, centered.
- **Header**:
    - Title: "Idea Cards"
    - Stats: "Total: X | Favorites: Y"
- **Controls Bar**:
    - Search Input.
    - Filter Dropdown (Color).
    - Filter Dropdown (Tags - dynamic).
- **Content Area**:
    - **Sidebar / Top Section (Form)**:
        - Title Input.
        - Content Textarea.
        - Tag Input (Enter to add).
        - Color Palette Selection.
        - "Add Card" Button.
    - **Grid Area (List)**:
        - Grid Layout (`display: grid`).
        - Responsive columns: 1 (mobile) -> 2 (tablet) -> 3/4 (desktop).
- **Card Component**:
    - Header: Title + Date.
    - Body: Truncated Content (rendered MD).
    - Footer: Tags, Actions (Edit, Fav, Delete).

## 3. Data Model
```javascript
interface Idea {
    id: string; // UUID or Date.now()
    title: string;
    content: string;
    tags: string[];
    color: string; // Hex or Class name
    createdAt: number; // Timestamp
    updatedAt: number;
    isFavorite: boolean;
}
```

## 4. Component Interaction
- **EventManager**:
    - `submit` -> `addCard()`
    - `input` (search) -> `renderCards()`
    - `click` (delete) -> `confirm` -> `deleteCard()`
- **StorageManager**:
    - Wrapper around `localStorage`.
    - Methods: `getIdeas()`, `saveIdeas(ideas)`.

## 5. CSS Strategy
- CSS Variables for colors and spacing.
- Flexbox and Grid for layout.
- Media queries for responsiveness (`@media (max-width: 768px)`).

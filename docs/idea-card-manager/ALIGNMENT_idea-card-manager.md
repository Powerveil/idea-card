# ALIGNMENT: Idea Card Manager

## 1. Project Context
- **Goal**: Create a single HTML page for managing idea cards.
- **Tech Stack**: Pure HTML, CSS, JavaScript. No external libraries (jQuery, Bootstrap, etc.).
- **Environment**: Browser-based, LocalStorage for persistence.

## 2. Requirements Understanding
- **Core Functionality**:
    - **Create**: Form with Title (max 50), Content (Markdown support), Tags, Color.
    - **Read**: Responsive grid layout. Display Title, Summary, Date. Hover effects.
    - **Update**: Edit functionality (implied by "Card Operations").
    - **Delete**: Delete with confirmation.
    - **Favorite**: Mark cards as favorite.
- **Interactions**:
    - Real-time stats (Total count).
    - Filter by Tag and Color.
    - Search by Title/Content.
    - Form validation and auto-clear.
- **UI/UX**:
    - Max width 1200px.
    - Clean, modern, responsive.
    - Visual hierarchy.

## 3. Consensus & Boundaries
- **Single File**: The output will be a single `index.html` containing HTML, CSS, and JS for portability and simplicity as requested.
- **Markdown**: Since no external libs are allowed, a simple custom Markdown parser (or just text formatting) will be implemented. It will support basic syntax like `# Header`, `**bold**`, `- list`.
- **Storage**: `localStorage` using a key like `idea-cards-data`.

## 4. Questions & Clarifications
- *Resolved*: "Single HTML page" interpreted as one file with embedded resources.
- *Resolved*: "Markdown" interpreted as basic custom parsing.

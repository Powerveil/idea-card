# ACCEPTANCE: Markdown Rendering Fix & Enhancement

## 1. Context
The original Markdown parser in `IdeaCard.vue` had several limitations:
- **Rendering Issues**: Failed to render bold text correctly when mixed with Chinese characters or specific symbols (e.g., `**“检查器（Checker）”**`).
- **List Conflicts**: List markers (`*`, `-`) conflicted with bold/italic markers, causing broken rendering.
- **Layout Issues**: Excessive whitespace and gaps in card previews due to poor line handling and default styling.
- **Missing Features**: Lack of support for headings and proper list structures.

## 2. Implemented Solutions

### 2.1 Robust Line-by-Line Parsing
- **Strategy**: Switched from global regex replacement to a **line-by-line processing** approach.
- **Benefit**: Isolates each line's context, preventing cross-line pollution and regex conflicts between different Markdown elements.

### 2.2 Enhanced Feature Support
- **Lists**: Added support for unordered lists (`- item`, `* item`).
  - *Implementation*: Detects list markers per line and wraps content in `<ul><li>...</li></ul>` with inline styles (`margin: 0; padding-left: 20px`) for correct indentation in cards.
- **Headings**: Added support for headings (`#` to `######`).
  - *Implementation*: Renders `h1`-`h6` with optimized inline styles (reduced margins and font sizes) to fit the card layout compact.
- **Bold/Italic**: Fixed regex to support:
  - Chinese characters and punctuation (e.g., `**测试**`).
  - Mixed content including code blocks within bold tags.
  - Non-greedy matching to prevent over-selection.

### 2.3 Layout Optimization
- **Whitespace Control**:
  - Filtered out empty lines to remove excessive vertical gaps.
  - Replaced `<br>` joins with `<div>` wrappers (`margin-bottom: 4px`) for precise spacing control.
- **Compact Typography**:
  - Adjusted heading line heights and margins to be more dense.
  - Optimized list spacing to prevent visual clutter in small card areas.

## 3. Verification
- [x] **Bold with Chinese**: `**“检查器（Checker）”**` renders correctly.
- [x] **Mixed Content**: Bold text containing code blocks works.
- [x] **Lists**: Unordered lists render with proper bullets and indentation.
- [x] **Headings**: `# Title` renders as a styled heading, not plain text.
- [x] **Spacing**: Card preview no longer has huge gaps between lines.

## 4. Technical Summary
- **File Modified**: `src/components/IdeaCard.vue`
- **Key Logic**: `parsedContent` computed property now splits text by newline, processes each line for structure (List/Heading) and inline styles (Bold/Code/Italic), and recombines using structured HTML (`div`, `ul`, `h*`).

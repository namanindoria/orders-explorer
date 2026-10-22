# Step 1: Design Before You Code

## System Planning & UX Architecture

The **Orders Explorer** is tailored specifically for an operations team working on 13-inch laptop screens (typically 1280x800 to 1440x900 resolution). Operations analysts operate at high velocity and prioritize keyboard efficiency, visual scanning density, and zero UI latency over decorative white space.

---

### Key Screen States & Wireframes

1. **Normal Screen with Data (`design/01-normal-state-wireframe.svg`)**
   - **Header Bar (48px)**: Brand indicator, keyboard shortcut reference cheatsheet, quick CSV export with real-time selection badge, and density toggle.
   - **Filter Builder Bar (Collapsible / Compact)**: 
     - Top-level AND grouping container with nested OR condition blocks.
     - Type-aware inputs (Text: contains/equals; Number: =, >, <, between; Date: before/after/between; Enum multi-select badges).
   - **Active Filter Chips Bar (36px)**:
     - High-visibility chips for every active condition, individually removable with one click (`×`).
     - Global "Clear all" button.
     - Live result counter displaying `1,284 of 49,970 orders (20 selected)` so the user always has clear feedback.
   - **Data Grid (Virtualized, Sticky Header, 32px Dense Row Height)**:
     - Pinned ID column staying fixed during horizontal scrolling.
     - Interactive column resizing handles on header cell borders.
     - Multi-selection checkboxes with Range Shift+Click selection support.
     - Active focused cell indicator ring for smooth arrow-key navigation.
   - **Order Detail Slide-Over Drawer (Activated via Enter / Click)**:
     - Full order breakdown: customer, normalized INR amount, raw schema notes (sanitized plain-text), timeline, and payment metadata.

2. **Zero-Matches Empty Screen (`design/02-empty-state-wireframe.svg`)**
   - Triggers when filter conditions exclude all ~50,000 orders.
   - Displays clear, non-intrusive feedback indicating the exact criteria that yielded zero results.
   - Highlights an immediate one-click **"Reset All Filters"** action button.
   - Preserves grid headers and filter bar so context is never lost.

---

### Design Decisions for 13-Inch Laptops

| UI Dimension | Specification | Rationale |
| :--- | :--- | :--- |
| **Row Height** | 32px - 34px | Maximizes visible rows on 13" laptop screens (displays ~18-22 rows without scrolling). |
| **Typography** | Inter / Roboto Monospace for IDs & Amounts | Tabular numerals prevent jitter during scroll and column alignment. |
| **Column Pinning** | Left-pinned `Order ID` | Ensures analysts never lose the primary key context when panning horizontally. |
| **Number Alignment** | Right-aligned with Indian Lakhs formatting | Enables rapid visual comparison of order magnitudes (`₹1,23,456.50`). |
| **Keyboard Navigation** | `↑ ↓ ← →` (Cell Move), `Space` (Select), `Enter` (Drawer), `Esc` (Close) | Operators can process batches entirely hands-on-keyboard without mouse reach. |

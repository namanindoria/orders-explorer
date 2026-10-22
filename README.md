# Orders Explorer — Merkle Science Frontend Take-Home Assignment

A high-density, keyboard-driven Orders Explorer engineered for operations teams working on 13-inch laptops. Built with **React**, **TypeScript**, and **Vite** with **zero data grid, virtualization, or query-builder libraries**.

---

## 1. How to Run It

### Prerequisites
- **Node.js**: v24 (v24.15.0+ tested)
- **Package Manager**: `npm` or `pnpm`

### Exact Commands
```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

```bash
# 3. Production build (typechecking + bundling)
npm run build
```

---

## 2. Screenshots

### Main Screen with 50,000 Live Orders
![Main Screen with Data](screenshots/main-screen-data.png)

### Zero Matches Empty State
![Empty State](screenshots/empty-state.png)

*(Wireframe design sketches created prior to coding can be found in the [`design/`](design/) directory).*

---

## 3. Dependencies

In strict accordance with the assignment rules, **no table, grid, virtualization, or query-builder libraries are used**. The data grid virtualization, column resizing, pinning, multi-selection, and filter engine are written 100% from scratch.

### Runtime Dependencies
- **`react` & `react-dom`** (`^19.0.0`): Core UI library for component rendering and state lifecycle.
- **`lucide-react`** (`^1.16.0`): Crisp, lightweight SVG icons for operations chrome (pin, sorting indicators, clipboard copy, delete, and keyboard shortcuts) without heavy component library overhead.

*(Note: Tailwind CSS and TypeScript are compile-time developer tools and introduce zero runtime footprint).*

---

## 4. Data Loading

### Strategy
1. The 17.2 MB dataset is hosted at `public/orders.json` for reliable local streaming fetch.
2. Data fetching, JSON parsing, schema normalization, and deduplication are executed inside a **dedicated Web Worker** (`src/workers/dataWorker.ts`) with a graceful main-thread fallback.
3. All 10 data sanitation rules from `data-notes.md` are executed in one unified pipeline before reaching the UI:
   - Unified `customer_name` (v1) and `customerName` (v2) into a single "Customer" column.
   - Converted v1 amounts from paise to rupees (divided by 100); sanitized string amounts; formatted using Indian currency convention (`₹1,23,456.50`).
   - Unified all 4 date representations (ISO with tz, ISO without tz treated as UTC, epoch seconds, DD/MM/YYYY midnight UTC) into epoch timestamps and consistent UTC strings.
   - Deduplicated order IDs (~30 pairs) prioritizing later `updatedAt`, existing `updatedAt`, or later occurrence in file.
   - Handled null `updatedAt` values by sorting them to the bottom/last.
   - Normalized status to lowercase and region to uppercase.
   - Handled missing priority as `None`.
   - Stripped HTML tags from notes to prevent XSS.
   - Trimmed trailing spaces from `"INR "`.

### Why This Choice
Parsing 17MB of JSON and cleansing 50,030 records takes ~150-250ms of CPU compute. Offloading this work to a Web Worker guarantees that the main UI thread never stutters, leaving loading spinners and initial paint running at 60 FPS.

---

## 5. The 200 Rows Question

### What We Chose
**Export only the visible, filtered subset of selected rows (e.g. 20 rows), while updating the UI selection count to display `20 selected (filtered from 200 total)`.**

### Why
- **Mental Model Integrity**: When an operations analyst applies a filter, their active focus is restricted to the filtered records. Exporting 180 rows that are currently hidden by active criteria can lead to unintended batch actions or compliance issues.
- **Transparent Feedback**: The selection badge explicitly informs the user: `20 selected (filtered from 200 total)`. This guarantees that the selection count shown on screen strictly matches the exact count of rows exported to CSV.

---

## 6. Design Changes (vs Initial Sketches)

- **Slide-Out Drawer over Fixed Dock**: The initial wireframe placed the detail panel as a fixed side-dock. In the final app, we adopted a slide-out drawer with a backdrop and keyboard `Escape` dismissal. This preserves maximum horizontal real estate for the 12 data columns on 13-inch laptop screens.
- **Collapsible Filter Builder**: Added a toggle to collapse the filter builder into a slim status bar with active chips, giving operators maximum vertical viewport space for scanning rows once filters are established.

---

## 7. Known Issues

- **Mass URL Selection Limits**: Selecting all 50,000 rows in memory works smoothly, but storing 50,000 IDs in URL query parameters would exceed browser URL length limits (8KB–32KB). In mass-selection states, URL serialization caps the parameter to maintain valid URLs.
- **Mobile Display**: The UI is optimized specifically for 13-inch laptop displays (dense layout, monospaced tabular figures, keyboard-first navigation) and is not intended for narrow mobile touchscreens.

---

## Keyboard Shortcuts Quick Reference

| Shortcut | Action |
| :--- | :--- |
| `↑` `↓` `←` `→` | Move focused cell with automatic scroll-into-view |
| `Space` | Select / Deselect the focused row |
| `Enter` | Open the focused row's complete Order Details drawer |
| `Escape` | Close the Order Details drawer |
| `Shift + Click` | Multi-select a range of rows |
| Click Header | Sort column (Ascending → Descending → None) |
| Header Divider Drag | Resize column width |
| 📌 Header Pin | Pin/Unpin column to the left during horizontal scroll |

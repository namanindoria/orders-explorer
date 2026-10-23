# Step 1: Design Planning Notes

Before writing any code, I spent about 25 minutes planning how the screen should work on a standard 13-inch laptop (roughly 1280x800 resolution) for an ops team that works fast and uses the keyboard heavily.

---

## 1. Planning the Layout

- **Header Bar (48px):** Keep it slim. Just the title, a quick cheat-sheet for keyboard shortcuts (`[↑↓←→]`, `[Space]`, `[Enter]`, `[Esc]`), and the CSV Export button with the count of currently selected rows.
- **Filter Builder:** Placed right above the table. Needs to support single-level grouping: conditions inside a group combine with `OR`, and different groups combine with `AND`. 
  - To keep the screen dense, I added a way to collapse the builder into a simple chips row once the filters are set.
- **Active Chips Bar:** Small badges for each active filter rule so the user can remove any condition with a single click (`×`) without re-opening dropdowns. Also has a "Clear all" button and live counts (`1,284 of 50,000 orders`).
- **Data Grid (Main focus):** Needs to show ~18-22 rows at once without feeling spaced out. 
  - Row height set to 34px (comfortable for fast scanning).
  - Left column pinned for Order ID so users don't lose track of which order they're looking at when scrolling right.
  - Numbers aligned to the right, dates kept in a single clean format (`DD Mon YYYY, HH:mm UTC`), and long text cut short with ellipses.
- **Details View:** Instead of a popup dialog that blocks the whole screen, I went with a slide-over drawer on the right. Pressing `Enter` opens it, and pressing `Esc` closes it.

---

## 2. The Two Required States

1. **Normal Screen with Data (`01-normal-state-wireframe.svg` / `01-normal-state.excalidraw`):**
   - Shows the grid populated with orders, pinned Order ID column, active filter chips above the grid, and the order details drawer open on the right.
2. **Zero Matches Screen (`02-empty-state-wireframe.svg` / `02-empty-state.excalidraw`):**
   - When a filter returns 0 results (e.g. `amount > 99999999`), replace the empty rows with a clear message and a prominent "Reset All Filters" button so the user doesn't get stuck.
   - The filter bar and chips remain visible so the user can see *why* 0 rows matched.

---

## 3. Keyboard Ergonomics for 13" Laptops

- `↑` `↓` `←` `→`: Moves the active cell. The focused cell has a clear sky-blue outline. If the cell moves outside the visible area, the grid automatically scrolls to keep it in view.
- `Space`: Toggles the checkbox on the currently focused row without needing a mouse click.
- `Enter`: Pops open the focused order's details drawer (showing full raw text of staff notes, timing, customer email, etc.).
- `Esc`: Closes the details drawer and returns focus to the grid.

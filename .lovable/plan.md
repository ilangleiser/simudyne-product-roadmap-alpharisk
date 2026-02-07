
## Unified Gantt Chart for All Products

Add a comprehensive Gantt chart to the Simudyne Product Roadmap hub page that displays all three product portfolios (Horizon, Pulse_SDG, AlphaRisk Studio) in a single unified timeline view.

---

### What It Does

The new unified Gantt chart will appear on the ProductHub page (the landing page at `/`) and show:
- All epics from all three products on a single timeline
- Product groupings with expandable/collapsible sections
- Color-coded product headers to distinguish between portfolios
- The same resizable column, expand/collapse, and timeline features as the existing Gantt chart

This allows stakeholders to see the complete Simudyne roadmap at a glance without navigating into individual products.

---

### Visual Structure

```text
+----------------------------------------------------------+
| Simudyne Product Roadmap                                 |
| [Select a product to manage...]                          |
+----------------------------------------------------------+
| [Product Cards: Horizon | Pulse_SDG | AlphaRisk Studio]  |
+----------------------------------------------------------+
| Portfolio Roadmap Overview           [2026] [Expand All] |
+----------------------------------------------------------+
| Product / Epic              | Jan Feb Mar ... Nov Dec    |
|-----------------------------|-----------------------------|
| ▼ Horizon (17 epics)        |                             |
|   ├─ Scoping                | ████                        |
|   ├─ Factor Evaluation      | ████                        |
|   └─ ...                    |                             |
| ▼ Pulse_SDG (11 epics)      |                             |
|   ├─ Scoping                | ████                        |
|   └─ ...                    |                             |
| ▼ AlphaRisk Studio (12 epics)|                            |
|   ├─ RegimeDetector         |     ████                    |
|   └─ ...                    |                             |
+----------------------------------------------------------+
| [Product Legend: Horizon | Pulse_SDG | AlphaRisk Studio] |
+----------------------------------------------------------+
```

---

### Components to Build

#### 1. New Component: `PortfolioGanttChart.tsx`

A variation of the existing GanttChart that:
- Accepts all products and their epics as a combined dataset
- Groups epics by product with collapsible product headers
- Uses distinct colors for each product (complementing existing quarter colors)
- Includes the same resizable column feature
- Shows aggregated stats (total epics, total stories across all products)

#### 2. New Component: `PortfolioGanttRow.tsx`

A row component that:
- Renders product group headers (collapsible)
- Renders individual epic rows within each product group
- Inherits the same expand/collapse behavior for stories within epics

#### 3. Update: `ProductHub.tsx`

Add the unified Gantt chart below the existing product cards:
- Load all epics from all products from localStorage
- Add year selector (matching the existing roadmap page pattern)
- Include the PortfolioGanttChart component

---

### Data Loading Strategy

The ProductHub already loads stats for all products from localStorage. We'll extend this to load the full epic arrays:

```text
PRODUCTS.forEach(product => {
  const stored = localStorage.getItem(`simudyne-epics-${product.id}`);
  allEpics.push({ product, epics: JSON.parse(stored) });
});
```

---

### Color Scheme for Products

To distinguish products in the unified view:
- **Horizon**: Blue tones (similar to Q1)
- **Pulse_SDG**: Green tones (similar to Q2)
- **AlphaRisk Studio**: Purple/Violet tones (distinct from quarters)

These will be added as Tailwind classes in the theme configuration.

---

### Files to Create

| File | Purpose |
|------|---------|
| `src/components/roadmap/PortfolioGanttChart.tsx` | Unified Gantt chart with product groupings |
| `src/components/roadmap/PortfolioGanttRow.tsx` | Product group and epic row rendering |

### Files to Modify

| File | Change |
|------|--------|
| `src/pages/ProductHub.tsx` | Add unified Gantt chart section below product cards |
| `src/index.css` | Add product-specific color classes for the portfolio view |

---

### Technical Details

**PortfolioGanttChart Props:**
```typescript
interface ProductEpics {
  product: Product;
  epics: Epic[];
}

interface PortfolioGanttChartProps {
  productData: ProductEpics[];
  year: number;
}
```

**State Management:**
- Expanded products tracked via `Set<string>` (product IDs)
- Expanded epics tracked via `Set<string>` (epic IDs)
- Both can be expanded/collapsed independently

**Reused Utilities:**
- `calculateBarStart`, `calculateBarWidth` from `ganttUtils.ts`
- `GanttTimeline` component for the header
- Same resize handle logic from `GanttChart.tsx`

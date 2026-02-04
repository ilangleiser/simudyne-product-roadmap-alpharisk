

## Multi-Product Hub for Simudyne

Create a product hub that allows navigation between two separate products: **Horizon** (current data) and **Pulse_SDG** (including OrderBookGPT), each with their own independent roadmaps, epics, and stories.

---

### Overview

The application will be restructured to include:
1. A **Product Hub** landing page for selecting between products
2. **Product-scoped routing** (e.g., `/horizon/dashboard`, `/pulse-sdg/roadmap`)
3. **Product-aware context** that filters data by selected product
4. **Separate data storage** per product in localStorage

---

### Architecture

```text
                    ┌─────────────────────────────────────┐
                    │         Product Hub (/)             │
                    │   ┌───────────┐   ┌───────────────┐ │
                    │   │  Horizon  │   │   Pulse_SDG   │ │
                    │   │           │   │ (OrderBookGPT)│ │
                    │   └─────┬─────┘   └───────┬───────┘ │
                    └─────────┼─────────────────┼─────────┘
                              │                 │
              ┌───────────────▼───────────────┐ │
              │   /horizon/*                  │ │
              │   - Dashboard                 │ │
              │   - Epics                     │ │
              │   - Roadmap                   │ │
              │   - Stories                   │ │
              │   - Import/Export/Generate    │ │
              └───────────────────────────────┘ │
                              ┌─────────────────▼─────────┐
                              │   /pulse-sdg/*            │
                              │   - Dashboard             │
                              │   - Epics                 │
                              │   - Roadmap               │
                              │   - Stories               │
                              │   - Import/Export/Generate│
                              └───────────────────────────┘
```

---

### Implementation Details

#### 1. Add Product Type and Context

**Create `src/types/product.ts`:**
| Field | Type | Description |
|-------|------|-------------|
| id | string | Product identifier (e.g., "horizon", "pulse-sdg") |
| name | string | Display name (e.g., "Horizon", "Pulse_SDG") |
| description | string | Product description |
| icon | string | Icon name for display |
| subProducts | string[] | Sub-products like "OrderBookGPT" |

**Create `src/contexts/ProductContext.tsx`:**
- Store currently selected product
- Provide `selectProduct()` and `currentProduct` values
- Persist selected product in localStorage

#### 2. Update Epic Type and Context

**Modify `src/types/epic.ts`:**
- Add `productId: string` field to Epic interface

**Modify `src/contexts/EpicContext.tsx`:**
- Separate localStorage keys per product: `simudyne-epics-horizon`, `simudyne-epics-pulse-sdg`
- Filter epics by current product when reading
- Product-aware import/export

#### 3. Create Product Hub Page

**Create `src/pages/ProductHub.tsx`:**
- Display product cards with:
  - Product name and description
  - Epic count and progress summary
  - Sub-products listed (e.g., OrderBookGPT for Pulse_SDG)
  - "Enter" button to navigate to product dashboard

**Design:**
```text
┌─────────────────────────────────────────────────────────┐
│                  Simudyne Product Roadmap               │
│                                                         │
│   ┌─────────────────────┐   ┌─────────────────────┐    │
│   │       Horizon       │   │      Pulse_SDG      │    │
│   │                     │   │                     │    │
│   │  Financial Risk     │   │  OrderBookGPT       │    │
│   │  Modeling Suite     │   │  AI Trading Suite   │    │
│   │                     │   │                     │    │
│   │  17 epics | Q1-Q4   │   │  0 epics | --       │    │
│   │                     │   │                     │    │
│   │  [Enter Product →]  │   │  [Enter Product →]  │    │
│   └─────────────────────┘   └─────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

#### 4. Update Routing

**Modify `src/App.tsx`:**

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | ProductHub | Product selection page |
| `/:productId/dashboard` | Dashboard | Product-specific dashboard |
| `/:productId/epics` | EpicsPage | Product-specific epics |
| `/:productId/roadmap` | RoadmapPage | Product-specific roadmap |
| `/:productId/stories` | StoriesPage | Product-specific stories |
| `/:productId/import` | ImportPage | Import for this product |
| `/:productId/generate` | GeneratePage | AI generation for product |
| `/:productId/export` | ExportPage | Export for product |
| `/settings` | SettingsPage | Global settings |

#### 5. Update Sidebar Navigation

**Modify `src/components/layout/Sidebar.tsx`:**
- Show current product name/icon in header
- Navigation links use product-prefixed routes
- Add "Switch Product" link back to hub
- Show product badge/indicator

**Modify `src/components/layout/MobileSidebar.tsx`:**
- Same changes as Sidebar

#### 6. Update Layout

**Modify `src/components/layout/AppLayout.tsx`:**
- Conditionally show sidebar only when inside a product
- Product Hub has a simpler layout without sidebar

#### 7. Seed Data Updates

**Modify `src/data/seedData.ts`:**
- Add `productId: "horizon"` to all existing Horizon epics
- Create `pulseSdgSeedEpics` array for Pulse_SDG (empty initially, ready for user import)

---

### Files to Create

| File | Purpose |
|------|---------|
| `src/types/product.ts` | Product type definitions |
| `src/contexts/ProductContext.tsx` | Product selection context |
| `src/pages/ProductHub.tsx` | Product selection landing page |

### Files to Modify

| File | Changes |
|------|---------|
| `src/types/epic.ts` | Add `productId` field |
| `src/contexts/EpicContext.tsx` | Product-aware data management |
| `src/App.tsx` | Add product-scoped routes |
| `src/components/layout/Sidebar.tsx` | Product-aware navigation |
| `src/components/layout/MobileSidebar.tsx` | Product-aware navigation |
| `src/components/layout/AppLayout.tsx` | Conditional sidebar display |
| `src/data/seedData.ts` | Add productId to Horizon data |
| `src/pages/Dashboard.tsx` | Use product context |
| `src/pages/EpicsPage.tsx` | Use product context |
| `src/pages/RoadmapPage.tsx` | Use product context |
| `src/pages/StoriesPage.tsx` | Use product context |
| `src/pages/ImportPage.tsx` | Import with product assignment |
| `src/pages/GeneratePage.tsx` | Use product context |
| `src/pages/ExportPage.tsx` | Export product-specific data |

---

### Product Definitions

**Horizon:**
- ID: `horizon`
- Name: Horizon
- Description: Financial Risk Modeling Suite
- Sub-products: Horizon Risk, Horizon Regime

**Pulse_SDG:**
- ID: `pulse-sdg`
- Name: Pulse_SDG
- Description: Sustainable Development Goals Analytics
- Sub-products: OrderBookGPT

---

### Technical Notes

1. **URL Structure**: Product ID in URL ensures shareable links work correctly
2. **Data Isolation**: Each product has separate localStorage for data independence
3. **Migration**: Existing Horizon data will be tagged with `productId: "horizon"` automatically
4. **Extensibility**: Adding new products requires only adding to the products config


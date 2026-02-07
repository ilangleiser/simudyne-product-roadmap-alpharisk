

## Add AlphaRisk Studio as a Third Product

Add AlphaRisk Studio to the Product Hub with its full 12-agent roadmap extracted from the uploaded PDF. The product will appear alongside Horizon and Pulse_SDG on the hub page.

---

### Product Definition

**AlphaRisk Studio**
- **ID**: `alpharisk-studio`
- **Name**: AlphaRisk Studio
- **Description**: Composable Simulation OS -- 12-Agent Marketplace
- **Icon**: `Sparkles` (representing AI/agents)
- **Sub-products**: RegimeDetector, OrderbookGPT, CausalValidator, AlphaForge, RiskOracle, CrowdingRadar, ExecutionOptimizer, LiquidityStress, PortfolioArchitect, CausalCouncil, RegimeAllocator, WorkflowOrchestrator

---

### Roadmap Epics (from PDF)

The 12 agents will be mapped to epics organized by their shipping quarter and tier, with dates derived from the PDF's shipping timeline:

| # | Epic Title | Module | Quarter | Tier | Date Range |
|---|-----------|--------|---------|------|------------|
| 1 | RegimeDetector | Model | Q2 | T1 - Foundation | Apr 6 - Apr 12, 2026 |
| 2 | OrderbookGPT | Model | Q2 | T2 - Simulation | Apr 13 - Apr 19, 2026 |
| 3 | CausalValidator | Model | Q2 | T1 - Foundation | Apr 20 - Apr 26, 2026 |
| 4 | AlphaForge | Model | Q2 | T1 - Foundation | Apr 27 - May 3, 2026 |
| 5 | RiskOracle | Model | Q3 | T2 - Simulation | Jul 6 - Jul 12, 2026 |
| 6 | CrowdingRadar | Model | Q3 | T2 - Simulation | Jul 13 - Jul 19, 2026 |
| 7 | ExecutionOptimizer | Pipeline | Q3 | T3 - Optimization | Jul 20 - Jul 26, 2026 |
| 8 | LiquidityStress | Model | Q3 | T3 - Optimization | Jul 27 - Aug 2, 2026 |
| 9 | PortfolioArchitect | Pipeline | Q3 | T3 - Optimization | Aug 3 - Aug 9, 2026 |
| 10 | CausalCouncil | Model | Q4 | T4 - Intelligence | Sep 28 - Oct 4, 2026 |
| 11 | RegimeAllocator | Model | Q4 | T4 - Intelligence | Oct 5 - Oct 11, 2026 |
| 12 | WorkflowOrchestrator | Pipeline | Q4 | T4 - Intelligence | Oct 12 - Oct 18, 2026 |

Additionally, 3 milestone epics will be added:
- **Marketplace Launch** (Q2 end) -- deployment and listing
- **Agent Composition Validation** (Q3 end) -- proving multi-agent MCP architecture
- **Full Studio Release** (Q4 end) -- $500K/desk/year product launch

---

### Changes Required

#### 1. `src/types/product.ts`
- Add AlphaRisk Studio to the `PRODUCTS` array with id `alpharisk-studio`

#### 2. `src/data/seedData.ts`
- Add `alphaRiskStudioSeedEpics` array with 15 epics (12 agents + 3 milestones)
- Each epic includes the agent description, tier, dependencies, and pricing from the PDF

#### 3. `src/contexts/EpicContext.tsx`
- Import the new seed data
- Add `alpharisk-studio` case to `getSeedData()` function

#### 4. `src/pages/ProductHub.tsx`
- Update the icon mapping to handle the new product's icon
- Adjust the grid layout from `md:grid-cols-2` to `md:grid-cols-3` to accommodate 3 product cards

#### 5. `src/components/layout/Sidebar.tsx`
- Add `Sparkles` to the icon mapping for AlphaRisk Studio's icon

#### 6. `src/components/layout/MobileSidebar.tsx`
- Same icon mapping update as Sidebar

---

### Hub Layout Update

The product grid will change from a 2-column layout to a 3-column layout:

```text
 -----------------------------------------------
|  Simudyne Product Roadmap                      |
|                                                 |
|  [Horizon]  [Pulse_SDG]  [AlphaRisk Studio]    |
|  17 epics    11 epics     15 epics              |
|  Q1-Q4       Q1-Q4        Q2-Q4                 |
 -----------------------------------------------
```

---

### Technical Notes

- The `max-w-4xl` constraint on the grid will be widened to `max-w-6xl` to fit 3 cards
- Each agent epic's `sprint` field will use the tier designation (e.g., "T1 - Foundation")
- The `customer` field will store the pricing info (e.g., "$25K/yr") for reference
- No routing or architecture changes needed -- the existing `/:productId` pattern handles any number of products automatically


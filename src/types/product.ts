export interface Product {
  id: string;
  name: string;
  description: string;
  icon: string;
  subProducts: string[];
}

export const PRODUCTS: Product[] = [
  {
    id: "horizon",
    name: "Horizon",
    description: "Financial Risk Modeling Suite",
    icon: "TrendingUp",
    subProducts: ["Horizon Risk", "Horizon Regime"],
  },
  {
    id: "pulse-sdg",
    name: "Pulse_SDG",
    description: "Sustainable Development Goals Analytics",
    icon: "Activity",
    subProducts: ["OrderBookGPT"],
  },
  {
    id: "alpharisk-studio",
    name: "AlphaRisk Studio",
    description: "Composable Simulation OS — 12-Agent Marketplace",
    icon: "Sparkles",
    subProducts: [
      "RegimeDetector",
      "OrderbookGPT",
      "CausalValidator",
      "AlphaForge",
      "RiskOracle",
      "CrowdingRadar",
      "ExecutionOptimizer",
      "LiquidityStress",
      "PortfolioArchitect",
      "CausalCouncil",
      "RegimeAllocator",
      "WorkflowOrchestrator",
    ],
  },
];

export const getProductById = (id: string): Product | undefined => {
  return PRODUCTS.find((p) => p.id === id);
};

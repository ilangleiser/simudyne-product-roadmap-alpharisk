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
];

export const getProductById = (id: string): Product | undefined => {
  return PRODUCTS.find((p) => p.id === id);
};

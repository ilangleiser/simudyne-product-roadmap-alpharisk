import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Product, PRODUCTS, getProductById } from "@/types/product";

interface ProductContextType {
  currentProduct: Product | null;
  products: Product[];
  selectProduct: (productId: string) => void;
  isProductRoute: boolean;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const STORAGE_KEY = "simudyne-last-product";

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);

  // Determine if we're on a product route
  const isProductRoute = !!productId;

  // Update current product when route changes
  useEffect(() => {
    if (productId) {
      const product = getProductById(productId);
      if (product) {
        setCurrentProduct(product);
        localStorage.setItem(STORAGE_KEY, productId);
      } else {
        // Invalid product ID, redirect to hub
        navigate("/", { replace: true });
      }
    } else {
      setCurrentProduct(null);
    }
  }, [productId, navigate]);

  const selectProduct = useCallback(
    (selectedProductId: string) => {
      const product = getProductById(selectedProductId);
      if (product) {
        setCurrentProduct(product);
        localStorage.setItem(STORAGE_KEY, selectedProductId);
        navigate(`/${selectedProductId}/dashboard`);
      }
    },
    [navigate]
  );

  return (
    <ProductContext.Provider
      value={{
        currentProduct,
        products: PRODUCTS,
        selectProduct,
        isProductRoute,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProduct() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error("useProduct must be used within a ProductProvider");
  }
  return context;
}

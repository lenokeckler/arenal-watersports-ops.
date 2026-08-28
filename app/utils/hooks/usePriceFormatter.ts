import { useCallback } from "react";

export const usePriceFormatter = () => {
  const formatPrice = useCallback(
    (price: number): string => `$${price.toFixed(2)}`,
    []
  );

  return { formatPrice };
};

export default usePriceFormatter;

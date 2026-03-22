import { SellableProduct } from "@/types/billing";

export const getSellLineTotals = (
  product: SellableProduct | undefined,
  quantity: number,
) => {
  if (!product || !quantity) {
    return {
      subtotal: 0,
      tax: 0,
      total: 0,
    };
  }

  const subtotal = product.unitPrice * quantity;
  const tax = (subtotal * product.gstRate) / 100;

  return {
    subtotal,
    tax,
    total: subtotal + tax,
  };
};

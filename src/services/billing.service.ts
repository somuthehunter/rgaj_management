import { OrderStatus } from "@/types";
import { addMockOrder, getMockOrdersSnapshot } from "@/services/order.service";
import { addMockTransaction } from "@/services/transaction.service";
import {
  BillGenerationResult,
  CreateBillPayload,
  SellableProduct,
} from "@/types/billing";
import { OrderLineItem } from "@/types/order";

let mockSellableProducts: SellableProduct[] = [
  {
    id: "prod-1",
    name: "Diamond Earrings 28K",
    sku: "EARR-28K-71534",
    category: "Diamond Collection",
    unitPrice: 18500,
    gstRate: 3,
    availableQuantity: 8,
  },
  {
    id: "prod-3",
    name: "Gold Necklace 22K Traditional",
    sku: "NECK-22K-001",
    category: "Gold Jewellery",
    unitPrice: 38500,
    gstRate: 3,
    availableQuantity: 5,
  },
  {
    id: "prod-6",
    name: "Gold Bangles 22K Pair",
    sku: "BANG-22K-001",
    category: "Gold Jewellery",
    unitPrice: 47200,
    gstRate: 3,
    availableQuantity: 4,
  },
  {
    id: "prod-7",
    name: "Temple Design Pendant",
    sku: "TEMP-PEND-014",
    category: "Temple Design",
    unitPrice: 16800,
    gstRate: 3,
    availableQuantity: 10,
  },
];

const delay = async () =>
  new Promise((resolve) => window.setTimeout(resolve, 120));

export const billingService = {
  // Replace this mock catalog with real sellable-product inventory when the billing API is ready.
  getSellableProducts: async () => {
    await delay();
    return {
      success: true,
      data: mockSellableProducts.map((item) => ({ ...item })),
    };
  },

  generateBill: async (
    payload: CreateBillPayload,
  ): Promise<BillGenerationResult> => {
    await delay();

    const now = new Date().toISOString();
    const existingOrders = getMockOrdersSnapshot();
    const nextOrderNumber = `RGAJ-${1000 + existingOrders.length + 1}`;

    const lineItems: OrderLineItem[] = payload.items.map((entry, index) => {
      const product = mockSellableProducts.find((item) => item.id === entry.productId);

      if (!product) {
        throw new Error("Selected product was not found.");
      }

      if (entry.quantity > product.availableQuantity) {
        throw new Error(`Only ${product.availableQuantity} unit(s) available for ${product.name}.`);
      }

      const lineSubtotal = product.unitPrice * entry.quantity;
      const lineTax = (lineSubtotal * product.gstRate) / 100;

      return {
        id: `${nextOrderNumber}-item-${index + 1}`,
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        category: product.category,
        quantity: entry.quantity,
        unitPrice: product.unitPrice,
        taxRate: product.gstRate,
        lineSubtotal,
        lineTax,
        lineTotal: lineSubtotal + lineTax,
      };
    });

    const subtotal = lineItems.reduce((total, item) => total + item.lineSubtotal, 0);
    const tax = lineItems.reduce((total, item) => total + item.lineTax, 0);
    const total = subtotal + tax;

    const order = addMockOrder({
      id: `order-${Date.now()}`,
      orderNumber: nextOrderNumber,
      storeId: payload.storeId || "store-1",
      storeName: payload.storeName || "Main Showroom",
      customer: {
        name: payload.customerName,
        phone: payload.customerPhone,
        email: payload.customerEmail,
        address: payload.customerAddress,
      },
      items: lineItems,
      subtotal,
      tax,
      total,
      status: OrderStatus.COMPLETED,
      paymentMethod: payload.paymentMethod,
      createdAt: now,
      notes: payload.notes,
    });

    mockSellableProducts = mockSellableProducts.map((product) => {
      const matched = payload.items.find((item) => item.productId === product.id);
      if (!matched) return product;

      return {
        ...product,
        availableQuantity: Math.max(0, product.availableQuantity - matched.quantity),
      };
    });

    addMockTransaction({
      id: `txn-log-${Date.now()}`,
      eventType: "SELL",
      module: "Orders",
      title: "Bill generated and order created",
      description: `${payload.customerName} order ${nextOrderNumber} was created from the billing page.`,
      performedBy: payload.performedBy || "System User",
      role: payload.performerRole || "STORE_ADMIN",
      storeName: payload.storeName || "Main Showroom",
      entityName: payload.customerName,
      referenceId: nextOrderNumber,
      createdAt: now,
      metadata: {
        items: payload.items.length,
        total,
        paymentMethod: payload.paymentMethod,
      },
    });

    return { order };
  },
};

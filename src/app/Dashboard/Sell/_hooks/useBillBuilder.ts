"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { billSchema, BillFormValues } from "@/schemas/bill.schema";
import { billingService } from "@/services/billing.service";
import { QUERY_KEYS } from "@/constants/query_keys";
import { getUser } from "@/services/session.service";

const defaultValues: BillFormValues = {
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  customerAddress: "",
  paymentMethod: "CASH",
  notes: "",
  items: [
    {
      productId: "",
      quantity: 1,
    },
  ],
};

export const useBillBuilder = () => {
  const queryClient = useQueryClient();
  const user = getUser();

  const form = useForm<BillFormValues>({
    resolver: zodResolver(billSchema),
    defaultValues,
  });

  const itemsFieldArray = useFieldArray({
    control: form.control,
    name: "items",
  });

  const productsQuery = useQuery({
    queryKey: ["sellable-products"],
    queryFn: () => billingService.getSellableProducts(),
  });

  const createBill = useMutation({
    mutationFn: (values: BillFormValues) =>
      billingService.generateBill({
        customerName: values.customerName,
        customerPhone: values.customerPhone,
        customerEmail: values.customerEmail || undefined,
        customerAddress: values.customerAddress || undefined,
        paymentMethod: values.paymentMethod,
        notes: values.notes || undefined,
        items: values.items,
        storeId: user?.storeId,
        storeName: user?.storeId ? undefined : "Main Showroom",
        performedBy: user?.name,
        performerRole: user?.role,
      }),
    onSuccess: async (result) => {
      toast.success(`Bill generated for order ${result.order.orderNumber}.`);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.ORDERS] }),
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CUSTOMERS] }),
        queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TRANSACTIONS] }),
        queryClient.invalidateQueries({ queryKey: ["sellable-products"] }),
      ]);
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to generate bill. Please try again.";
      toast.error(message);
    },
  });

  return {
    form,
    itemsFieldArray,
    products: productsQuery.data?.data ?? [],
    productsLoading: productsQuery.isLoading,
    generatedOrder: createBill.data?.order ?? null,
    isSubmitting: createBill.isPending,
    submitBill: form.handleSubmit((values) => createBill.mutate(values)),
  };
};

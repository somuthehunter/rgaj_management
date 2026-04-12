"use client";

import { useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { billSchema, BillFormValues } from "@/schemas/bill.schema";
import { billingService } from "@/services/billing.service";
import { getUser } from "@/services/session.service";
import { normalizeRole } from "@/lib/auth";
import { UserRole } from "@/types";
import { storeService } from "@/services/store.service";

const defaultValues: BillFormValues = {
  storeId: "",
  customerName: "",
  customerPhone: "",
  customerEmail: "",
  customerAddress: "",
  paymentMethod: "CASH",
  items: [
    {
      productId: "",
      weight: 0,
      stoneCount: 0,
    },
  ],
};

export const useBillBuilder = () => {
  const user = getUser();
  const role = normalizeRole(user?.role);
  const isSuperAdmin = role === UserRole.SUPER_ADMIN;

  const form = useForm<BillFormValues>({
    resolver: zodResolver(billSchema),
    defaultValues: {
      ...defaultValues,
      storeId: user?.storeId ?? "",
    },
  });

  const itemsFieldArray = useFieldArray({
    control: form.control,
    name: "items",
  });

  useEffect(() => {
    if (!isSuperAdmin && user?.storeId) {
      form.setValue("storeId", user.storeId);
    }
  }, [form, isSuperAdmin, user?.storeId]);

  const selectedStoreId = form.watch("storeId") || user?.storeId || "";

  const storesQuery = useQuery({
    queryKey: ["billing-store-options"],
    queryFn: () => storeService.search({ page: 1, limit: 100, isActive: true }),
    enabled: isSuperAdmin,
  });

  const productsQuery = useQuery({
    queryKey: ["sellable-products", selectedStoreId],
    queryFn: () => billingService.getSellableProducts(selectedStoreId),
    enabled: Boolean(selectedStoreId),
  });

  const createBill = useMutation({
    mutationFn: async (values: BillFormValues) => {
      const resolvedStoreId = isSuperAdmin ? values.storeId?.trim() : user?.storeId;

      if (!resolvedStoreId) {
        throw new Error("Select a store before generating a bill.");
      }

      return billingService.generateBill({
        storeId: resolvedStoreId,
        paymentMethod: values.paymentMethod,
        items: values.items.map((item) => ({
          productId: item.productId,
          weight: item.weight,
          stoneCount: item.stoneCount || undefined,
        })),
        customer: {
          name: values.customerName || undefined,
          phone: values.customerPhone || undefined,
          email: values.customerEmail || undefined,
          address: values.customerAddress || undefined,
        },
      });
    },
    onSuccess: (result) => {
      toast.success(`Invoice ${result.invoice.invoiceNumber} generated successfully.`);
      form.reset({
        ...defaultValues,
        storeId: isSuperAdmin ? form.getValues("storeId") : user?.storeId ?? "",
      });
    },
    onError: (error) => {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to generate bill. Please try again.";
      toast.error(message);
    },
  });

  const selectedStoreName = useMemo(() => {
    if (!selectedStoreId) return "";

    return (
      storesQuery.data?.data.find((store) => store.id === selectedStoreId)?.name ??
      (selectedStoreId === user?.storeId ? "Your Store" : "")
    );
  }, [selectedStoreId, storesQuery.data?.data, user?.storeId]);

  return {
    form,
    itemsFieldArray,
    isSuperAdmin,
    stores: storesQuery.data?.data ?? [],
    storesLoading: storesQuery.isLoading,
    products: productsQuery.data?.data ?? [],
    productsLoading: productsQuery.isLoading,
    productsError: productsQuery.error,
    selectedStoreId,
    selectedStoreName,
    generatedInvoice: createBill.data?.invoice ?? null,
    isSubmitting: createBill.isPending,
    submitBill: form.handleSubmit((values) => createBill.mutate(values)),
  };
};

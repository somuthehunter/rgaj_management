"use client";

import { useProducts } from "./_hooks/useProducts";
import { useProductMutations } from "./_hooks/useProductMutations";
import ProductTable from "./_component/ProductTable";
import AddProductDialog from "./_component/AddProductDialog";
import { getUser } from "@/services/session.service";
import { UserRole } from "@/types";
import { toast } from "sonner";

type ApiErrorPayload = {
  message?: string;
  error?: {
    message?: string;
  };
};

const getErrorMessage = (error: unknown) => {
  const err = error as Error & { data?: unknown };
  const payload = err?.data as ApiErrorPayload | undefined;
  return (
    payload?.error?.message ||
    payload?.message ||
    err?.message ||
    "Operation failed. Please try again."
  );
};

export default function ProductsPage() {
  const { data, isLoading } = useProducts();
  const { deleteProduct, returnProduct } = useProductMutations();

  const user = getUser();
  const normalizedRole = user?.role?.toUpperCase();
  const isAdmin =
    normalizedRole === UserRole.SUPER_ADMIN ||
    normalizedRole === "ADMIN";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Products</h1>
        <AddProductDialog />
      </div>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <ProductTable
          products={data}
          isAdmin={isAdmin}
          onDelete={(id: string) =>
            deleteProduct.mutate(id, {
              onSuccess: () => {
                toast.success("Product deleted successfully.");
              },
              onError: (error) => {
                toast.error(getErrorMessage(error));
              },
            })
          }
          onReturn={(id: string) =>
            returnProduct.mutate(
              { id, qty: 1 },
              {
                onSuccess: () => {
                  toast.success("Product returned successfully.");
                },
                onError: (error) => {
                  toast.error(getErrorMessage(error));
                },
              },
            )
          }
        />
      )}
    </div>
  );
}

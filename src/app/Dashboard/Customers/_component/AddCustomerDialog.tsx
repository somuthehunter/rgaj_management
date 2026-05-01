"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { customerService } from "@/services/customer.service";
import { QUERY_KEYS } from "@/constants/query_keys";

const initialForm = {
  name: "",
  phone: "",
  email: "",
  address: "",
};

export default function AddCustomerDialog() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createCustomer = useMutation({
    mutationFn: () =>
      customerService.create({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        address: form.address.trim() || undefined,
      }),
    onSuccess: async () => {
      toast.success("Customer saved successfully.");
      await queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.CUSTOMERS] });
      setForm(initialForm);
      setErrors({});
      setOpen(false);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to save customer.");
    },
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          setForm(initialForm);
          setErrors({});
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Customer</DialogTitle>
        </DialogHeader>

        <form
          className="space-y-4 pt-2"
          onSubmit={(event) => {
            event.preventDefault();
            const nextErrors: Record<string, string> = {};

            if (!form.name.trim()) {
              nextErrors.name = "Customer name is required.";
            }

            if (!/^\d{10}$/.test(form.phone.trim())) {
              nextErrors.phone = "Phone number must be exactly 10 digits.";
            }

            if (
              form.email.trim() &&
              !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
            ) {
              nextErrors.email = "Enter a valid email address.";
            }

            setErrors(nextErrors);

            if (Object.keys(nextErrors).length > 0) {
              return;
            }

            createCustomer.mutate();
          }}
        >
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Enter customer name"
              maxLength={80}
            />
            <p className="text-sm text-destructive">{errors.name}</p>
          </div>

          <div className="space-y-2">
            <Label>Phone *</Label>
            <Input
              type="tel"
              inputMode="numeric"
              maxLength={10}
              value={form.phone}
              onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
              placeholder="10-digit phone number"
            />
            <p className="text-sm text-destructive">{errors.phone}</p>
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              placeholder="name@example.com"
            />
            <p className="text-sm text-destructive">{errors.email}</p>
          </div>

          <div className="space-y-2">
            <Label>Address</Label>
            <Textarea
              rows={3}
              value={form.address}
              onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
              placeholder="Enter address if available"
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!form.name.trim() || !form.phone.trim() || createCustomer.isPending}
          >
            {createCustomer.isPending ? "Saving..." : "Save Customer"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

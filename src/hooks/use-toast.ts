"use client";

type ToastLike = {
  id: string;
  title?: string;
  description?: string;
  action?: unknown;
};

const noop = () => undefined;

export function useToast() {
  return {
    toasts: [] as ToastLike[],
    toast: noop,
    dismiss: noop,
  };
}

export const toast = noop;

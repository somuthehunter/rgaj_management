"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { driver, type Driver, type DriveStep } from "driver.js";
import { Pause, Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

const TOUR_AUTO_STARTED_KEY = "rgaj_inventory_tour_auto_started";

type DashboardTourControlProps = {
  compact?: boolean;
};

export default function DashboardTourControl({
  compact = false,
}: DashboardTourControlProps) {
  const pathname = usePathname();
  const normalizedPath = pathname.toLowerCase();
  const [status, setStatus] = useState<"idle" | "playing" | "paused">("idle");
  const [activeIndex, setActiveIndex] = useState(0);
  const [pausedPath, setPausedPath] = useState<string | null>(null);
  const manualStopRef = useRef(false);
  const tourRef = useRef<Driver | null>(null);

  const steps = useMemo<DriveStep[]>(() => {
    const common: DriveStep[] = [
      {
        element: '[data-tour="sidebar-toggle"]',
        popover: {
          title: "Sidebar toggle",
          description: "Use this to collapse or expand navigation.",
          side: "right",
          align: "center",
        },
      },
      {
        element: '[data-tour="theme-toggle"]',
        popover: {
          title: "Theme switch",
          description: "Toggle between light and dark theme.",
          side: "right",
          align: "center",
        },
      },
    ];

    if (normalizedPath.includes("/dashboard/sell")) {
      return [
        ...common,
        {
          element: '[data-tour="sell-header"]',
          popover: {
            title: "Sell workflow",
            description: "This page helps you create a customer invoice from live inventory.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: '[data-tour="sell-customer-fields"]',
          popover: {
            title: "Customer and payment details",
            description: "Enter customer info and choose payment method before adding items.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: '[data-tour="sell-items-editor"]',
          popover: {
            title: "Add bill items",
            description: "Select products, enter sold weight, and add/remove bill lines.",
            side: "top",
            align: "start",
          },
        },
        {
          element: '[data-tour="sell-generate"]',
          popover: {
            title: "Generate bill",
            description: "Review estimated totals here and click Generate Bill to submit.",
            side: "top",
            align: "end",
          },
        },
        {
          element: '[data-tour="sell-generated-bill"]',
          popover: {
            title: "Generated invoice",
            description: "After generation, review invoice details and print the final bill here.",
            side: "left",
            align: "start",
          },
        },
      ];
    }

    if (normalizedPath.includes("/dashboard/orders")) {
      return [
        ...common,
        {
          element: '[data-tour="orders-header"]',
          popover: {
            title: "Orders workflow",
            description: "Use this module to monitor and inspect placed orders.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: '[data-tour="orders-filters"]',
          popover: {
            title: "Search and filters",
            description: "Filter by store, status, and sort to quickly find specific orders.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: '[data-tour="orders-table"]',
          popover: {
            title: "Orders table",
            description: "Review order rows and open a record to inspect bill details.",
            side: "top",
            align: "start",
          },
        },
        {
          element: '[data-tour="orders-pagination"]',
          popover: {
            title: "Pagination",
            description: "Move through pages when records are spread across multiple screens.",
            side: "top",
            align: "end",
          },
        },
      ];
    }

    if (normalizedPath.includes("/dashboard/inventory")) {
      return [
        ...common,
        {
          element: '[data-tour="inventory-header"]',
          popover: {
            title: "Inventory workflow",
            description: "Track, allocate, transfer, and audit stock from this module.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: '[data-tour="inventory-actions"]',
          popover: {
            title: "Stock actions",
            description: "Admins can receive, distribute, and transfer stock from these actions.",
            side: "bottom",
            align: "end",
          },
        },
        {
          element: '[data-tour="inventory-store-section"]',
          popover: {
            title: "Store stock panel",
            description: "This section shows stock allocated to stores.",
            side: "top",
            align: "start",
          },
        },
        {
          element: '[data-tour="inventory-filters"]',
          popover: {
            title: "Filter stock",
            description: "Search by product/SKU/store and refine results with filters.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: '[data-tour="inventory-table"]',
          popover: {
            title: "Inventory table",
            description: "Inspect available stock and stock movement visibility by item.",
            side: "top",
            align: "start",
          },
        },
      ];
    }

    if (normalizedPath.includes("/dashboard/customers")) {
      return [
        ...common,
        {
          element: '[data-tour="customers-header"]',
          popover: {
            title: "Customers workflow",
            description: "Manage customer records and view linked purchase activity.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: '[data-tour="customers-add"]',
          popover: {
            title: "Add customer",
            description: "Create a new customer profile from here.",
            side: "left",
            align: "center",
          },
        },
        {
          element: '[data-tour="customers-filters"]',
          popover: {
            title: "Find customers",
            description: "Search and filter records, then export filtered results as CSV.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: '[data-tour="customers-table"]',
          popover: {
            title: "Customer list",
            description: "Open rows to inspect details and linked order history.",
            side: "top",
            align: "start",
          },
        },
      ];
    }

    if (normalizedPath.includes("/dashboard/refunds")) {
      return [
        ...common,
        {
          element: '[data-tour="refunds-header"]',
          popover: {
            title: "Refunds workflow",
            description: "Review and process refund requests with invoice-linked traceability.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: '[data-tour="refunds-create"]',
          popover: {
            title: "Create refund",
            description: "Start a new refund for an RFID item using this action.",
            side: "left",
            align: "center",
          },
        },
        {
          element: '[data-tour="refunds-filters"]',
          popover: {
            title: "Search and filter",
            description: "Filter refunds by status and search by refund/invoice/store references.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: '[data-tour="refunds-date-filters"]',
          popover: {
            title: "Date range",
            description: "Use From/To date to narrow refunds to a specific time window.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: '[data-tour="refunds-table"]',
          popover: {
            title: "Refund table",
            description: "Inspect refund rows and verify returned item and processing status.",
            side: "top",
            align: "start",
          },
        },
      ];
    }

    return [
      ...common,
      {
        element: '[data-tour="nav-overview"]',
        popover: {
          title: "Overview",
          description: "Start here for a high-level dashboard summary.",
          side: "right",
          align: "center",
        },
      },
      {
        element: '[data-tour="main-content"]',
        popover: {
          title: "Work area",
          description: "Open a module tab and press Play tour for a page-specific walkthrough.",
          side: "top",
          align: "start",
        },
      },
      {
        element: '[data-tour="logout"]',
        popover: {
          title: "Logout",
          description: "End your current session from here.",
          side: "right",
          align: "center",
        },
      },
    ];
  }, [normalizedPath]);

  const createTour = useCallback(() => {
    const availableSteps = steps.filter((step) => {
      if (!step.element || typeof step.element !== "string") return true;
      return Boolean(document.querySelector(step.element));
    });

    return driver({
      showProgress: true,
      allowClose: true,
      doneBtnText: "Finish",
      steps: availableSteps,
      onHighlighted: (_element, _step, options) => {
        setActiveIndex(options.state.activeIndex ?? 0);
      },
      onDestroyed: () => {
        if (manualStopRef.current) {
          manualStopRef.current = false;
          setActiveIndex(0);
          setStatus("idle");
          setPausedPath(null);
          return;
        }
        setPausedPath(normalizedPath);
        setStatus("paused");
      },
    });
  }, [normalizedPath, steps]);

  const startTour = useCallback(
    (fromIndex: number) => {
      manualStopRef.current = false;
      tourRef.current?.destroy();
      const tour = createTour();
      tourRef.current = tour;
      setStatus("playing");
      tour.drive(fromIndex);
    },
    [createTour],
  );

  const handlePlayPause = useCallback(() => {
    if (status === "playing") {
      tourRef.current?.destroy();
      return;
    }
    const canResumeCurrentPage =
      status === "paused" && pausedPath === normalizedPath;
    startTour(canResumeCurrentPage ? activeIndex : 0);
  }, [activeIndex, normalizedPath, pausedPath, startTour, status]);

  const handleStop = useCallback(() => {
    manualStopRef.current = true;
    tourRef.current?.destroy();
    tourRef.current = null;
  }, []);

  useEffect(() => {
    const hasAutoStarted = localStorage.getItem(TOUR_AUTO_STARTED_KEY);
    if (hasAutoStarted) return;
    const timeoutId = window.setTimeout(() => {
      localStorage.setItem(TOUR_AUTO_STARTED_KEY, "1");
      startTour(0);
    }, 800);
    return () => window.clearTimeout(timeoutId);
  }, [startTour]);

  useEffect(() => {
    return () => {
      manualStopRef.current = true;
      tourRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    manualStopRef.current = true;
    tourRef.current?.destroy();
    tourRef.current = null;
    setStatus("idle");
    setActiveIndex(0);
    setPausedPath(null);
  }, [normalizedPath]);

  return (
    <div className={`flex items-center ${compact ? "gap-1" : "gap-2"}`}>
      <Button
        type="button"
        variant="outline"
        size={compact ? "icon" : "sm"}
        onClick={handlePlayPause}
        aria-label={status === "playing" ? "Pause tour" : "Play tour"}
        title={status === "playing" ? "Pause tour" : "Play tour"}
      >
        {status === "playing" ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
        {!compact && (
          <span>{status === "playing" ? "Pause tour" : "Play tour"}</span>
        )}
      </Button>
      <Button
        type="button"
        variant="ghost"
        size={compact ? "icon" : "sm"}
        onClick={handleStop}
        aria-label="Stop tour"
        title="Stop tour"
      >
        <Square className="h-4 w-4" />
        {!compact && <span>Stop</span>}
      </Button>
    </div>
  );
}

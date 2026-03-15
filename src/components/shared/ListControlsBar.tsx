"use client";

import { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

export type SelectOption = {
  label: string;
  value: string;
};

export type SelectControl = {
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  options: SelectOption[];
  onValueChange: (value: string) => void;
};

type ListControlsBarProps = {
  searchValue: string;
  onSearchValueChange: (value: string) => void;
  searchPlaceholder?: string;
  selectControls?: SelectControl[];
  onReset?: () => void;
  extraActions?: ReactNode;
  className?: string;
};

export default function ListControlsBar({
  searchValue,
  onSearchValueChange,
  searchPlaceholder = "Search...",
  selectControls = [],
  onReset,
  extraActions,
  className,
}: ListControlsBarProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchValue}
            onChange={(e) => onSearchValueChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          {onReset && (
            <Button type="button" variant="outline" onClick={onReset}>
              Reset
            </Button>
          )}
          {extraActions}
        </div>
      </div>

      {selectControls.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {selectControls.map((control) => (
            <div key={control.id} className="space-y-1.5">
              <Label htmlFor={control.id}>{control.label}</Label>
              <Select value={control.value} onValueChange={control.onValueChange}>
                <SelectTrigger id={control.id}>
                  <SelectValue placeholder={control.placeholder ?? control.label} />
                </SelectTrigger>
                <SelectContent>
                  {control.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

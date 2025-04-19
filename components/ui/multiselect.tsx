"use client";

import * as React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";
import { Checkbox } from "./checkbox";
import { Button } from "./button";
import { ChevronDownIcon } from "lucide-react";

interface MultiSelectOption {
  label: string;
  value: string;
  color?: string; // for color swatch
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  label?: string;
  showColorSwatch?: boolean;
  disabled?: boolean;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select...",
  label,
  showColorSwatch = false,
  disabled,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const selectedLabels = options
    .filter((opt) => selected.includes(opt.value))
    .map((opt) => opt.label)
    .join(", ");

  return (
    <div>
      {label && (
        <div className="mb-1 text-xs text-muted-foreground">{label}</div>
      )}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between"
            aria-haspopup="listbox"
            aria-expanded={open}
            disabled={disabled}
          >
            <span className="truncate">
              {selectedLabels || (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </span>
            <ChevronDownIcon className="ml-2 size-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-56 p-2 bg-popover border rounded shadow z-[9999]"
          align="start"
          side="bottom"
        >
          <div className="max-h-60 overflow-y-auto">
            {options.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-accent rounded"
              >
                <Checkbox
                  checked={selected.includes(opt.value)}
                  onCheckedChange={() => handleToggle(opt.value)}
                  className="mr-2"
                  aria-label={opt.label}
                  disabled={disabled}
                />
                {showColorSwatch && opt.color && (
                  <span
                    className="inline-block w-4 h-4 rounded-full border"
                    style={{ backgroundColor: opt.color }}
                  />
                )}
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

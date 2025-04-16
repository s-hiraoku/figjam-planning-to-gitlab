import React from "react";
import { MultiSelect } from "@/components/ui/multiselect";

// Define the option type locally as it's not exported
interface MultiSelectOption {
  label: string;
  value: string;
  color?: string; // for color swatch
}

interface StickyNoteFilterSectionProps {
  sectionOptions: MultiSelectOption[];
  selectedSections: string[];
  onSectionChange: (selected: string[]) => void;
  colorOptions: MultiSelectOption[];
  selectedColors: string[];
  onColorChange: (selected: string[]) => void;
}

export function StickyNoteFilterSection({
  sectionOptions,
  selectedSections,
  onSectionChange,
  colorOptions,
  selectedColors,
  onColorChange,
}: StickyNoteFilterSectionProps) {
  return (
    <div className="flex flex-wrap gap-4 mb-4">
      <div className="w-64">
        <MultiSelect
          options={sectionOptions}
          selected={selectedSections}
          onChange={onSectionChange}
          placeholder="セクションで絞り込み"
          label="セクション"
        />
      </div>
      <div className="w-64">
        <MultiSelect
          options={colorOptions}
          selected={selectedColors}
          onChange={onColorChange}
          placeholder="色で絞り込み"
          label="色"
          showColorSwatch // Assuming MultiSelect supports this prop
        />
      </div>
    </div>
  );
}

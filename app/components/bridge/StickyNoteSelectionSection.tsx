import React from "react";
import { StickyNoteList } from "components/sticky-notes/sticky-note-list";
import type { FigmaStickyNote } from "types/figma";

interface StickyNoteSelectionSectionProps {
  filteredNotes: FigmaStickyNote[];
  selectedNotes: Set<string>;
  onSelectionChange: (selectedIds: Set<string>) => void;
  isEditMode: boolean;
}

export function StickyNoteSelectionSection({
  filteredNotes,
  selectedNotes,
  onSelectionChange,
  isEditMode,
}: StickyNoteSelectionSectionProps) {
  return (
    <StickyNoteList
      disabled={!isEditMode}
      notes={filteredNotes}
      selectedNotes={selectedNotes}
      onSelectionChange={onSelectionChange}
    />
  );
}

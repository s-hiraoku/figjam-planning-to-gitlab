import React from "react";
import { StickyNoteList } from "components/sticky-notes/sticky-note-list";
import { FigmaStickyNote } from "types/figma";

interface StickyNoteSelectionSectionProps {
  filteredNotes: FigmaStickyNote[];
  selectedNotes: string[];
  onSelectionChange: (selectedIds: string[]) => void;
}

export function StickyNoteSelectionSection({
  filteredNotes,
  selectedNotes,
  onSelectionChange,
}: StickyNoteSelectionSectionProps) {
  return (
    <StickyNoteList
      notes={filteredNotes}
      selectedNotes={selectedNotes}
      onSelectionChange={onSelectionChange}
    />
  );
}

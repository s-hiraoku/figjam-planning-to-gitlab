import { useAtom } from "jotai";
import { selectedNotesAtom } from "@/app/atoms/bridgeAtoms";
import React from "react";
import { StickyNoteList } from "components/sticky-notes/sticky-note-list";
import type { FigmaStickyNote } from "types/figma";

interface StickyNoteSelectionSectionProps {
  filteredNotes: FigmaStickyNote[];
  onSelectionChange: (selectedIds: Set<string>) => void;
  isEditMode: boolean;
}

export function StickyNoteSelectionSection({
  filteredNotes,
  onSelectionChange,
  isEditMode,
}: StickyNoteSelectionSectionProps) {
  const [selectedNotes] = useAtom(selectedNotesAtom);
  return (
    <StickyNoteList
      disabled={!isEditMode}
      notes={filteredNotes}
      selectedNotes={selectedNotes}
      onSelectionChange={onSelectionChange}
    />
  );
}

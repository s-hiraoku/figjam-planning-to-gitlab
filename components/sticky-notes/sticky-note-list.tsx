import React from "react";
import { StickyNoteCard } from "./sticky-note-card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { FigmaStickyNote } from "types/figma";

interface StickyNoteListProps {
  notes: FigmaStickyNote[];
  selectedNotes: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  disabled?: boolean;
}

export function StickyNoteList({
  notes,
  selectedNotes,
  onSelectionChange,
  disabled,
}: StickyNoteListProps) {
  const handleNoteToggle = (note: FigmaStickyNote) => {
    const noteId = note.document?.id || note.id;
    if (!noteId) return;
    const newSelection = selectedNotes.includes(noteId)
      ? selectedNotes.filter((id) => id !== noteId)
      : [...selectedNotes, noteId];
    onSelectionChange(newSelection);
  };

  const handleSelectAllToggle = () => {
    if (selectedNotes.length === notes.length) {
      onSelectionChange([]); // Deselect all
    } else {
      onSelectionChange(notes.map((note) => note.document?.id || note.id)); // Select all
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Checkbox
          id="select-all-notes"
          checked={notes.length > 0 && selectedNotes.length === notes.length}
          onCheckedChange={handleSelectAllToggle}
          disabled={notes.length === 0 || disabled}
        />
        <Label htmlFor="select-all-notes" className="ml-2">
          Select All ({selectedNotes.length} / {notes.length})
        </Label>
      </div>

      {notes.length === 0 ? (
        <p className="text-muted-foreground text-center py-4">
          No sticky notes loaded.
        </p>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {notes.map((note, index) => {
            const noteId = note.document?.id || note.id || index.toString();
            return (
              <StickyNoteCard
                key={noteId}
                note={note}
                isSelected={selectedNotes.includes(noteId)}
                onSelectToggle={() => handleNoteToggle(note)}
                disabled={disabled}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

import React, { memo } from "react";
import { StickyNoteCard } from "./sticky-note-card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox"; // Import Checkbox
import type { FigmaStickyNote } from "types/figma";

interface StickyNoteListProps {
  notes: FigmaStickyNote[];
  selectedNotes: Set<string>;
  onSelectionChange: (selectedIds: Set<string>) => void;
  disabled?: boolean;
}

export const StickyNoteList = memo(function StickyNoteList({
  notes,
  selectedNotes,
  onSelectionChange,
  disabled,
}: StickyNoteListProps) {
  const handleNoteToggle = (note: FigmaStickyNote) => {
    const noteId = note.document?.id || note.id;
    if (!noteId) return;
    const newSelection = new Set(selectedNotes); // Create a new Set instance
    if (newSelection.has(noteId)) {
      newSelection.delete(noteId);
    } else {
      newSelection.add(noteId);
    }
    onSelectionChange(newSelection);
  };

  const isAllSelected = React.useMemo(() => {
    return notes.length > 0 && selectedNotes.size === notes.length;
  }, [notes.length, selectedNotes.size]);

  const isSomeSelected = React.useMemo(() => {
    return selectedNotes.size > 0 && selectedNotes.size < notes.length;
  }, [notes.length, selectedNotes.size]);

  return (
    <div className="space-y-4">
      {/* Replace Button with Checkbox and Label */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="select-all-checkbox"
          checked={
            isAllSelected ? true : isSomeSelected ? "indeterminate" : false
          }
          onCheckedChange={(checked) => {
            if (notes.length === 0 || disabled) return;
            // If checked is true (meaning it was unchecked before click), select all.
            // If checked is false (meaning it was checked or indeterminate before click), deselect all.
            const nextSelection =
              checked === true
                ? new Set(
                    notes
                      .map((note) => note.document?.id || note.id)
                      .filter((id): id is string => id !== undefined)
                  )
                : new Set<string>();
            onSelectionChange(nextSelection);
          }}
          disabled={notes.length === 0 || disabled}
          aria-label="Select all notes"
        />
        <Label
          htmlFor="select-all-checkbox"
          className={` ${
            notes.length === 0 || disabled ? "text-muted-foreground" : ""
          }`}
        >
          Select All ({selectedNotes.size} / {notes.length})
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
                isSelected={selectedNotes.has(noteId)}
                onSelectToggle={() => handleNoteToggle(note)}
                disabled={disabled}
              />
            );
          })}
        </div>
      )}
    </div>
  );
});

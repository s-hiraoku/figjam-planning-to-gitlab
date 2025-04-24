import React, { useRef, useCallback, useState, useEffect } from "react";
import { StickyNoteCard } from "./sticky-note-card";
import { Label } from "@/components/ui/label";
import type { FigmaStickyNote } from "types/figma";

interface StickyNoteListProps {
  notes: FigmaStickyNote[];
  selectedNotes: Set<string>;
  onSelectionChange: (selectedIds: Set<string>) => void;
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

  // Local state to manage the checkbox checked status

  // Ref to track if the change originated from the local checkbox handler

  return (
    <div className="space-y-4">
      <button
        type="button"
        className={`flex items-center px-2 py-1 border rounded ${
          isAllSelected ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-800"
        } ${
          notes.length === 0 || disabled ? "opacity-50 cursor-not-allowed" : ""
        }`}
        onClick={() => {
          if (notes.length === 0 || disabled) return;
          const nextSelection = isAllSelected
            ? new Set<string>()
            : new Set(
                notes
                  .map((note) => note.document?.id || note.id)
                  .filter((id): id is string => id !== undefined)
              );
          onSelectionChange(nextSelection);
        }}
        disabled={notes.length === 0 || disabled}
      >
        {isAllSelected ? "Deselect All" : "Select All"} ({selectedNotes.size} /{" "}
        {notes.length})
      </button>

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
}

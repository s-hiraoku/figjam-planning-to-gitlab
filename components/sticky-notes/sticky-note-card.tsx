import React, { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FigmaStickyNote } from "types/figma";

interface StickyNoteCardProps {
  note: FigmaStickyNote;
  isSelected: boolean;
  onSelectToggle: (id: string) => void;
  disabled?: boolean;
}

// Helper function to convert Figma color to CSS hex
const figmaColorToHex = (color?: {
  r: number;
  g: number;
  b: number;
  a: number;
}): string => {
  if (!color) return "#FFFFFF"; // Default color
  const { r, g, b } = color;
  const toHex = (c: number) =>
    Math.round(c * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const StickyNoteCardComponent = ({
  note,
  isSelected,
  onSelectToggle,
  disabled,
}: StickyNoteCardProps) => {
  const noteText =
    note.document?.characters ||
    note.document?.name ||
    note.characters ||
    note.name ||
    "No text";
  // Use color from note.document if available, else fallback
  const stickyColor =
    note.document?.fills?.[0]?.color || note.fills?.[0]?.color;
  const backgroundColor = figmaColorToHex(stickyColor) || "#FFEB3B"; // default yellow

  // Robust contrast check for text color (black or white)
  function getContrastYIQ({ r, g, b }: { r: number; g: number; b: number }) {
    const yiq = (r * 255 * 299 + g * 255 * 587 + b * 255 * 114) / 1000;
    return yiq >= 128 ? "text-black" : "text-white";
  }
  let textColor = "text-black";
  if (stickyColor) {
    textColor = getContrastYIQ(stickyColor);
  }
  return (
    <Card
      style={{ backgroundColor, cursor: disabled ? "not-allowed" : "pointer" }}
      className={`relative transition-opacity ${
        isSelected ? "opacity-100" : "opacity-70 hover:opacity-100"
      } ${disabled ? "opacity-50 grayscale" : ""}`}
      onClick={() => !disabled && onSelectToggle(note.document?.id || note.id)}
      tabIndex={0}
      role="button"
      aria-pressed={isSelected}
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => onSelectToggle(note.document?.id || note.id)}
        className="absolute top-2 left-2 z-10 bg-white border-gray-400"
        aria-label={`Select note ${note.document?.id || note.id}`}
        onClick={(e) => e.stopPropagation()}
        disabled={disabled}
      />
      <CardContent className={`p-4 pt-8 ${textColor}`}>
        <p className="text-sm whitespace-pre-wrap break-words">{noteText}</p>
        {/* Optionally display other info like ID */}
        {/* <p className="text-xs mt-2 opacity-60">{note.id}</p> */}
      </CardContent>
    </Card>
  );
};

export const StickyNoteCard = memo(StickyNoteCardComponent);

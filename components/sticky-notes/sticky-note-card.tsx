import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FigmaStickyNote } from "types/figma";

interface StickyNoteCardProps {
  note: FigmaStickyNote;
  isSelected: boolean;
  onSelectToggle: (id: string) => void;
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

export function StickyNoteCard({
  note,
  isSelected,
  onSelectToggle,
}: StickyNoteCardProps) {
  const noteText = note.characters || note.name || "No text";
  const backgroundColor = figmaColorToHex(note.fills?.[0]?.color);

  // Basic contrast check for text color (simple version)
  const isDarkBackground =
    (note.fills?.[0]?.color?.r ?? 0) * 0.299 +
      (note.fills?.[0]?.color?.g ?? 0) * 0.587 +
      (note.fills?.[0]?.color?.b ?? 0) * 0.114 <
    0.5;
  const textColor = isDarkBackground ? "text-white" : "text-black";

  return (
    <Card
      style={{ backgroundColor }}
      className={`relative transition-opacity ${
        isSelected ? "opacity-100" : "opacity-70 hover:opacity-100"
      }`}
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => onSelectToggle(note.id)}
        className="absolute top-2 left-2 z-10 bg-white border-gray-400"
        aria-label={`Select note ${note.id}`}
      />
      <CardContent className={`p-4 pt-8 ${textColor}`}>
        <p className="text-sm whitespace-pre-wrap break-words">{noteText}</p>
        {/* Optionally display other info like ID */}
        {/* <p className="text-xs mt-2 opacity-60">{note.id}</p> */}
      </CardContent>
    </Card>
  );
}

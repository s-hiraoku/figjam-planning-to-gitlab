import { useState, useMemo } from "react";
import type { FigmaStickyNote } from "types/figma";

// Helper function to convert Figma color to hex
const figmaColorToHex = (color: {
  r: number;
  g: number;
  b: number;
}): string => {
  const toHex = (c: number) =>
    Math.round(c * 255)
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
};

// Standard FigJam colors with Japanese labels
const STANDARD_COLOR_LABELS: { [key: string]: string } = {
  "#ffc700": "黄色", // Yellow - Standard FigJam Yellow
  "#1abcfe": "青", // Blue - Standard FigJam Blue
  "#f24822": "赤", // Red - Standard FigJam Red
  "#0acf83": "緑", // Green - Standard FigJam Green
  "#7b61ff": "紫", // Purple - Standard FigJam Purple
  "#ff72a6": "ピンク", // Pink - Standard FigJam Pink
  "#808080": "灰色", // Gray - Standard FigJam Gray
  "#ffffff": "白", // White - Standard FigJam White
  "#a8daff": "青", // Blue - New Standard
  "#d3bdff": "紫", // Purple - New Standard
  "#ffa8db": "ピンク", // Pink - New Standard
  "#ffafa3": "赤", // Red - New Standard
  "#ffe299": "黄色", // Yellow - New Standard
};

// Known legacy colors with Japanese labels
const LEGACY_COLOR_LABELS: { [key: string]: string } = {
  "#e6e6e6": "グレー", // Gray (Legacy) -> Updated Label
  "#ffd3a8": "オレンジ", // Orange (Legacy) -> Updated Label
  "#fffa3a": "黄色 (旧)", // Yellow (Legacy) - Unchanged
  "#b3efbd": "緑", // Green (Legacy) -> Updated Label
  "#b3f4ef": "青緑", // Teal (Legacy) -> Updated Label
  "#a8d3ff": "青 (旧)", // Blue (Legacy) - Unchanged (Note: #a8daff is the new standard Blue)
  "#ffb3b3": "赤 (旧)", // Red (Legacy) - Unchanged
  "#75d7f0": "水色（旧）", // Light Blue (Legacy) - New Legacy
  "#80caff": "青（旧）", // Blue (Legacy) - New Legacy
  "#85e0a3": "緑（旧）", // Green (Legacy) - New Legacy
  "#afbccf": "グレー (旧)", // Gray (Legacy) - New Legacy
  "#ffbdf2": "ピンク（旧）", // Pink (Legacy) - New Legacy
  "#ffc470": "オレンジ（旧）", // Orange (Legacy) - New Legacy
  "#ffd966": "黄色（旧）", // Yellow (Legacy) - New Legacy
};

export function useStickyNoteFilters(stickyNotes: FigmaStickyNote[]) {
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  const sectionOptions = useMemo(() => {
    const defaultSectionName = "セクションなし";
    const sectionSet = new Set<string>(
      stickyNotes.map(
        (note) =>
          note.document?.sectionName ||
          note.sectionName || // Access directly if available
          defaultSectionName
      )
    );

    return Array.from(sectionSet)
      .map((name) => ({
        label: name === defaultSectionName ? "（セクションなし）" : name,
        value: name,
      }))
      .sort((a, b) =>
        a.value === defaultSectionName
          ? -1
          : b.value === defaultSectionName
          ? 1
          : 0
      );
  }, [stickyNotes]);

  const colorOptions = useMemo(() => {
    const colorSet = new Set<string>();
    for (const note of stickyNotes) {
      const color = note.document?.fills?.[0]?.color || note.fills?.[0]?.color;
      if (color) {
        colorSet.add(JSON.stringify(color));
      }
    }

    const options = Array.from(colorSet).map((colorStr) => {
      const color = JSON.parse(colorStr);
      const hex = figmaColorToHex(color);
      const lowerHex = hex.toLowerCase();

      let label = STANDARD_COLOR_LABELS[lowerHex];
      if (!label) {
        label = LEGACY_COLOR_LABELS[lowerHex];
      }
      if (!label) {
        label = `不明 (${hex})`; // Label for unknown colors
      }

      return {
        label: label,
        value: hex, // Keep original hex casing for value if needed, though filtering uses lowercase
        // color: hex, // Removed as it's redundant with value and not used downstream
      };
    });

    // Sort options for consistent display order (optional, but good practice)
    // Example: Sort by label
    options.sort((a, b) => a.label.localeCompare(b.label, "ja"));

    return options;
  }, [stickyNotes]);

  const filteredNotes = useMemo(() => {
    return stickyNotes.filter((note) => {
      // Section filter
      const defaultSectionName = "セクションなし";
      const section =
        note.document?.sectionName ||
        note.sectionName || // Access directly if available
        defaultSectionName;
      if (selectedSections.length > 0 && !selectedSections.includes(section)) {
        return false;
      }

      // Color filter
      const color = note.document?.fills?.[0]?.color || note.fills?.[0]?.color;
      let hex = "";
      if (color) {
        hex = figmaColorToHex(color);
      }
      if (selectedColors.length > 0 && !selectedColors.includes(hex)) {
        return false;
      }

      return true;
    });
  }, [stickyNotes, selectedSections, selectedColors]);

  return {
    selectedSections,
    setSelectedSections,
    selectedColors,
    setSelectedColors,
    sectionOptions,
    colorOptions,
    filteredNotes,
  };
}

import { useState, useMemo } from "react";
import { FigmaStickyNote } from "types/figma";

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

// Helper function to get closest color name (extracted from original component)
const getClosestColorName = (hex: string): string => {
  const colorRefList = [
    { hex: "#ffffff", name: "白", rgb: [255, 255, 255] },
    { hex: "#e6e6e6", name: "灰色", rgb: [230, 230, 230] },
    { hex: "#ffd3a8", name: "オレンジ", rgb: [255, 211, 168] },
    { hex: "#fffa3a", name: "黄色", rgb: [255, 250, 58] },
    { hex: "#b3efbd", name: "緑", rgb: [179, 239, 189] },
    { hex: "#b3f4ef", name: "青緑", rgb: [179, 244, 239] },
    { hex: "#a8d3ff", name: "青", rgb: [168, 211, 255] },
    { hex: "#ffb3b3", name: "赤", rgb: [255, 179, 179] },
  ];
  const hexToRgb = (h: string): [number, number, number] => {
    const hexClean = h.replace("#", "");
    return [
      parseInt(hexClean.substring(0, 2), 16),
      parseInt(hexClean.substring(2, 4), 16),
      parseInt(hexClean.substring(4, 6), 16),
    ];
  };
  const rgb = hexToRgb(hex.toLowerCase());
  let minDist = Infinity;
  let closest = colorRefList[0];
  for (const ref of colorRefList) {
    const dist =
      Math.pow(rgb[0] - ref.rgb[0], 2) +
      Math.pow(rgb[1] - ref.rgb[1], 2) +
      Math.pow(rgb[2] - ref.rgb[2], 2);
    if (dist < minDist) {
      minDist = dist;
      closest = ref;
    }
  }
  return closest.name;
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (note as any).sectionName || // Keep potential fallback
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
    stickyNotes.forEach((note) => {
      const color = note.document?.fills?.[0]?.color || note.fills?.[0]?.color;
      if (color) colorSet.add(JSON.stringify(color));
    });

    let options = Array.from(colorSet).map((colorStr) => {
      const color = JSON.parse(colorStr);
      const hex = figmaColorToHex(color);
      const colorLabelMap: { [hex: string]: string } = {
        "#ffffff": "白",
        "#e6e6e6": "灰色",
        "#ffd3a8": "オレンジ",
        "#fffa3a": "黄色",
        "#b3efbd": "緑",
        "#b3f4ef": "青緑",
        "#a8d3ff": "青",
        "#ffb3b3": "赤",
      };

      let jpName = colorLabelMap[hex.toLowerCase()];
      if (!jpName) {
        const closest = getClosestColorName(hex);
        // Apply specific overrides based on closest match or hex
        if (closest === "灰色") jpName = "ピンク（OLD）";
        else if (closest === "赤") jpName = "赤";
        else if (hex.toLowerCase() === "#a8d3ff" || closest === "青")
          jpName = "青";
        else jpName = closest + "（OLD）";
      }

      return {
        label: jpName,
        value: hex,
        color: hex,
      };
    });

    // Apply index-based overrides (maintain original logic)
    const labelOverrides: { [idx: number]: string } = {
      4: "黄色",
      8: "紫",
      9: "ピンク",
      10: "グレー（OLD）",
      12: "水色（OLD）",
      14: "青（OLD）",
    };
    options = options.map((opt, i) =>
      labelOverrides[i] ? { ...opt, label: labelOverrides[i] } : opt
    );

    return options;
  }, [stickyNotes]);

  const filteredNotes = useMemo(() => {
    return stickyNotes.filter((note) => {
      // Section filter
      const defaultSectionName = "セクションなし";
      const section =
        note.document?.sectionName ||
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (note as any).sectionName ||
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

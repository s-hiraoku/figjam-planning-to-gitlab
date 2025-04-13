"use client"; // This component needs client-side interactivity

import { useState, useMemo } from "react"; // Added useMemo
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner"; // Import toast from sonner
import { StickyNoteList } from "components/sticky-notes/sticky-note-list"; // Import the list
import { MultiSelect } from "@/components/ui/multiselect"; // Added MultiSelect import
import { FigmaStickyNote } from "types/figma";
import { FigmaPreview } from "@/components/figma-viewer/FigmaPreview";

// Placeholder type for GitLabLabel - replace with actual type when available
interface GitLabLabel {
  id: string;
  name: string;
  color: string;
}

export default function BridgePage() {
  const [figmaUrl, setFigmaUrl] = useState("");
  const [fileKey, setFileKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [stickyNotes, setStickyNotes] = useState<FigmaStickyNote[]>([]);
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [urlError, setUrlError] = useState<string | null>(null); // State for URL error
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [gitlabLabels, setGitlabLabels] = useState<GitLabLabel[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedGitlabLabels, setSelectedGitlabLabels] = useState<string[]>(
    []
  );
  // --- Filter state ---
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  // --- Extract unique section names and colors from stickyNotes ---
  const sectionOptions = useMemo(() => {
    const defaultSectionName = "セクションなし";
    const sectionSet = new Set<string>(
      stickyNotes.map(
        (note) =>
          note.document?.sectionName ||
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (note as any).sectionName ||
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
    const set = new Set<string>();
    stickyNotes.forEach((note) => {
      const color = note.document?.fills?.[0]?.color || note.fills?.[0]?.color;
      if (color) set.add(JSON.stringify(color));
    });
    // 色のhex→日本語名マッピング
    const colorNameMap: { [hex: string]: string } = {
      "#FFEB3B": "黄色",
      "#F44336": "赤",
      "#2196F3": "青",
      "#4CAF50": "緑",
      "#FF9800": "オレンジ",
      "#9C27B0": "紫",
      "#E91E63": "ピンク",
      "#795548": "茶色",
      "#607D8B": "グレー",
      "#FFFFFF": "白",
      "#000000": "黒",
    };
    let options = Array.from(set).map((colorStr, i) => {
      const color = JSON.parse(colorStr);
      // Convert to hex for swatch
      const toHex = (c: number) =>
        Math.round(c * 255)
          .toString(16)
          .padStart(2, "0");
      const hex = `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
      // 画像にある色のhex→日本語名
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
      // 画像にある色のRGB
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
      function hexToRgb(hex: string): [number, number, number] {
        const h = hex.replace("#", "");
        return [
          parseInt(h.substring(0, 2), 16),
          parseInt(h.substring(2, 4), 16),
          parseInt(h.substring(4, 6), 16),
        ];
      }
      function getClosestColorName(hex: string): string {
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
      }
      let jpName = colorLabelMap[hex.toLowerCase()];
      if (!jpName) {
        const closest = getClosestColorName(hex);
        if (closest === "灰色") {
          jpName = "ピンク（OLD）";
        } else if (closest === "赤") {
          jpName = "赤";
        } else if (hex.toLowerCase() === "#a8d3ff" || closest === "青") {
          jpName = "青";
        } else {
          jpName = closest + "（OLD）";
        }
      }
      return {
        label: jpName,
        value: hex,
        color: hex,
      };
    });
    // インデックス指定でラベルを上書き
    const labelOverrides: { [idx: number]: string } = {
      4: "黄色", // 5番目
      8: "紫", // 9番目
      9: "ピンク", // 10番目
      10: "グレー（OLD）", // 11番目
      12: "水色（OLD）", // 13番目
      14: "青（OLD）", // 15番目
    };
    options = options.map((opt, i) =>
      labelOverrides[i] ? { ...opt, label: labelOverrides[i] } : opt
    );
    return options;
  }, [stickyNotes]);

  // --- Filter notes ---
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
        const toHex = (c: number) =>
          Math.round(c * 255)
            .toString(16)
            .padStart(2, "0");
        hex = `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
      }
      if (selectedColors.length > 0 && !selectedColors.includes(hex)) {
        return false;
      }
      return true;
    });
  }, [stickyNotes, selectedSections, selectedColors]);

  const extractFileKey = (url: string): string | null => {
    try {
      const urlParts = new URL(url);
      // Supports both /file/ and /board/ URLs
      // Example: https://www.figma.com/file/FILE_KEY/... or https://www.figma.com/board/BOARD_KEY/...
      const match = urlParts.pathname.match(
        /(?:file|board)\/([a-zA-Z0-9_-]+)([/|?]|$)/
      );
      return match ? match[1] : null;
    } catch {
      return null; // Invalid URL
    }
  };

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = event.target.value;
    setFigmaUrl(newUrl);
    const extractedKey = extractFileKey(newUrl);
    console.log("URL:", newUrl); // Add logging
    console.log("Extracted Key:", extractedKey); // Add logging
    setFileKey(extractedKey);

    if (!extractedKey && newUrl !== "") {
      setUrlError(
        "Invalid FigJam URL. /file/ または /board/ のURLを入力してください。"
      );
    } else {
      setUrlError(null); // Clear error if URL is valid or empty
    }
  };

  const fetchStickyNotes = async () => {
    if (!fileKey) {
      // Correct sonner usage: toast.error(title, { description })
      toast.error("Invalid FigJam URL", {
        description: "Please enter a valid FigJam file URL.",
      });
      return;
    }

    setIsLoading(true);
    setStickyNotes([]); // Clear previous notes
    setSelectedNotes([]);

    try {
      // Fetch all nodes first to identify stickies
      const nodesResponse = await fetch(`/api/figma/nodes/${fileKey}`);
      if (!nodesResponse.ok) {
        const errorData = await nodesResponse.json();
        throw new Error(errorData.error || "Failed to fetch FigJam nodes");
      }
      const nodesData = await nodesResponse.json();

      // Extract sticky notes from the response
      const notes = Object.values(nodesData.nodes || {}) as FigmaStickyNote[];
      setStickyNotes(notes);
      if (notes.length > 0) {
        console.log("First sticky note object:", notes[0]);
      }

      if (notes.length === 0) {
        // Correct sonner usage: toast.info(title, { description })
        toast.info("No Sticky Notes Found", {
          description:
            "No sticky notes were found in the specified FigJam file.",
        });
      } else {
        // Correct sonner usage: toast.success(title, { description })
        toast.success("Sticky Notes Loaded", {
          description: `${notes.length} sticky notes found.`,
        });
      }
    } catch (error) {
      // Remove 'any' type
      console.error("Error fetching sticky notes:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
      // Correct sonner usage: toast.error(title, { description })
      toast.error("Error Loading Sticky Notes", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Placeholder for future functions
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const fetchGitlabLabels = async () => {
    // TODO: Implement GitLab label fetching
    console.log("Fetching GitLab labels...");
  };

  const handleCreateIssues = async () => {
    if (selectedNotes.length === 0) {
      toast.error("No Sticky Notes Selected", {
        description: "Please select at least one sticky note to register.",
      });
      return;
    }

    // Use filteredNotes to get the correct note objects
    const notesToRegister = filteredNotes.filter((note) =>
      selectedNotes.includes(note.document?.id || note.id)
    );

    let successCount = 0;
    let errorCount = 0;

    for (const note of notesToRegister) {
      try {
        const noteId = note.document?.id || note.id;
        const noteText =
          note.document?.characters ||
          note.characters ||
          "Untitled Sticky Note";

        const res = await fetch("/api/gitlab/issues", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: noteText,
            description: `Imported from FigJam: https://www.figma.com/file/${fileKey}?node-id=${noteId}`,
            labels: selectedGitlabLabels,
          }),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to create GitLab issue");
        }

        successCount++;
      } catch (error) {
        errorCount++;
        console.error("Error creating GitLab issue:", error);
      }
    }

    if (successCount > 0) {
      toast.success("GitLab Issues Created", {
        description: `${successCount} issue(s) created successfully.`,
      });
    }
    if (errorCount > 0) {
      toast.error("Some Issues Failed", {
        description: `${errorCount} issue(s) failed to create. Check console for details.`,
      });
    }
  };

  const handleSelectionChange = (selectedIds: string[]) => {
    setSelectedNotes(selectedIds);
  };

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      <h1 className="text-3xl font-bold">FigJam to GitLab Bridge</h1>

      <Card>
        <CardHeader>
          <CardTitle>1. Enter FigJam URL</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="figma-url">FigJam File URL</Label>
            <Input
              id="figma-url"
              type="url"
              placeholder="https://www.figma.com/file/..."
              value={figmaUrl}
              onChange={handleUrlChange}
              disabled={isLoading}
              aria-invalid={!!urlError}
              aria-describedby={urlError ? "figma-url-error" : undefined}
            />
            {urlError && (
              <p id="figma-url-error" className="text-sm text-red-600">
                {urlError}
              </p>
            )}
            {fileKey && !urlError && (
              <p className="text-sm text-muted-foreground">
                Detected File Key: {fileKey}
              </p>
            )}
          </div>
          <Button
            onClick={fetchStickyNotes}
            disabled={!fileKey || isLoading || !!urlError}
          >
            {isLoading ? "Loading Notes..." : "Load Sticky Notes"}
          </Button>
        </CardContent>
        {/* Figma Preview Accordion */}
        {figmaUrl && !urlError && (
          <div className="mb-4 px-6">
            <details className="rounded border bg-white">
              <summary className="cursor-pointer px-4 py-2 text-sm font-medium select-none">
                Figma Preview (click to expand/collapse)
              </summary>
              <div className="p-2">
                <FigmaPreview url={figmaUrl} />
              </div>
            </details>
          </div>
        )}
      </Card>

      {/* --- Filter UI --- */}
      {stickyNotes.length > 0 && (
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="w-64">
            <MultiSelect
              options={sectionOptions}
              selected={selectedSections}
              onChange={setSelectedSections}
              placeholder="セクションで絞り込み"
              label="セクション"
            />
          </div>
          <div className="w-64">
            <MultiSelect
              options={colorOptions}
              selected={selectedColors}
              onChange={setSelectedColors}
              placeholder="色で絞り込み"
              label="色"
              showColorSwatch
            />
          </div>
        </div>
      )}
      {/* Sticky Notes List */}
      {stickyNotes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>2. Select Sticky Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <StickyNoteList
              notes={filteredNotes} // Use filteredNotes
              selectedNotes={selectedNotes}
              onSelectionChange={handleSelectionChange}
            />
            <Button
              className="mt-4"
              onClick={handleCreateIssues}
              disabled={selectedNotes.length === 0}
              variant="default"
            >
              Register Selected as GitLab Issues
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Placeholder for GitLab Labels */}
      {selectedNotes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>3. Select GitLab Labels</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              GitLab label selection will be here.
            </p>
            {/* TODO: Implement GitLab label selector */}
            <Button onClick={handleCreateIssues} className="mt-4">
              Create {selectedNotes.length} GitLab Issues
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

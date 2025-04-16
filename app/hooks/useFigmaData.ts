import { useState, useCallback } from "react";
import { toast } from "sonner";
import { FigmaStickyNote } from "types/figma";

const extractFileKey = (url: string): string | null => {
  try {
    const urlParts = new URL(url);
    // Supports both /file/ and /board/ URLs
    const match = urlParts.pathname.match(
      /(?:file|board)\/([a-zA-Z0-9_-]+)([/|?]|$)/
    );
    return match ? match[1] : null;
  } catch {
    return null; // Invalid URL
  }
};

export function useFigmaData() {
  const [figmaUrl, setFigmaUrl] = useState("");
  const [fileKey, setFileKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [stickyNotes, setStickyNotes] = useState<FigmaStickyNote[]>([]);
  const [urlError, setUrlError] = useState<string | null>(null);

  const handleUrlChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newUrl = event.target.value;
      setFigmaUrl(newUrl);
      const extractedKey = extractFileKey(newUrl);
      console.log("URL:", newUrl);
      console.log("Extracted Key:", extractedKey);
      setFileKey(extractedKey);

      if (!extractedKey && newUrl !== "") {
        setUrlError(
          "Invalid FigJam URL. /file/ または /board/ のURLを入力してください。"
        );
      } else {
        setUrlError(null); // Clear error if URL is valid or empty
      }
    },
    []
  );

  const fetchStickyNotes = useCallback(async () => {
    if (!fileKey) {
      toast.error("Invalid FigJam URL", {
        description: "Please enter a valid FigJam file URL.",
      });
      return;
    }

    setIsLoading(true);
    setStickyNotes([]); // Clear previous notes
    // Note: selectedNotes state is managed outside this hook now

    try {
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
        toast.info("No Sticky Notes Found", {
          description:
            "No sticky notes were found in the specified FigJam file.",
        });
      } else {
        toast.success("Sticky Notes Loaded", {
          description: `${notes.length} sticky notes found.`,
        });
      }
    } catch (error) {
      console.error("Error fetching sticky notes:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
      toast.error("Error Loading Sticky Notes", {
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }, [fileKey]);

  return {
    figmaUrl,
    setFigmaUrl, // Expose setter if needed by components directly (though handleUrlChange is preferred)
    fileKey,
    isLoading,
    stickyNotes,
    urlError,
    handleUrlChange,
    fetchStickyNotes,
  };
}

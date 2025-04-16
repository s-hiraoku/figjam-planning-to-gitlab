import { useState, useCallback } from "react";
import { toast } from "sonner";
import { FigmaStickyNote } from "types/figma";

// Re-define or import GitLabLabel type
interface GitLabLabel {
  id: string;
  title: string;
  color: string; // Keep color if needed for UI, otherwise simplify
  description: string; // Keep description if needed
}

export function useGitLabIntegration(
  filteredNotes: FigmaStickyNote[],
  selectedNotes: string[],
  fileKey: string | null // Pass fileKey needed for issue description
) {
  const [gitlabLabels, setGitlabLabels] = useState<GitLabLabel[]>([]);
  const [selectedGitlabLabelIds, setSelectedGitlabLabelIds] = useState<
    string[]
  >([]);
  const [isCreatingIssues, setIsCreatingIssues] = useState(false); // Add loading state

  // Fetch GitLab labels from API
  const fetchGitlabLabels = useCallback(async () => {
    // Consider adding a loading state for label fetching if needed
    try {
      const res = await fetch("/api/gitlab/labels");
      if (!res.ok) {
        throw new Error("Failed to fetch GitLab labels");
      }
      const data = await res.json();
      console.log("🚀 ~ fetchGitlabLabels ~ data:", data);
      setGitlabLabels(data.labels || []);
    } catch (error) {
      console.error("Error fetching GitLab labels:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred.";
      toast.error("Error Fetching GitLab Labels", {
        description: errorMessage,
      });
      setGitlabLabels([]); // Clear labels on error
    }
  }, []);

  // Handle creation of GitLab issues
  const handleCreateIssues = useCallback(async () => {
    if (selectedNotes.length === 0) {
      toast.error("No Sticky Notes Selected", {
        description: "Please select at least one sticky note to register.",
      });
      return;
    }
    if (!fileKey) {
      toast.error("Figma File Key Missing", {
        description: "Cannot create issues without a valid Figma file key.",
      });
      return;
    }

    setIsCreatingIssues(true);
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
            labelIds: selectedGitlabLabelIds,
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
        // Optionally provide more specific error toast per issue?
      }
    }

    setIsCreatingIssues(false);

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
  }, [selectedNotes, filteredNotes, fileKey, selectedGitlabLabelIds]);

  return {
    gitlabLabels,
    fetchGitlabLabels,
    selectedGitlabLabelIds,
    setSelectedGitlabLabelIds,
    handleCreateIssues,
    isCreatingIssues,
  };
}

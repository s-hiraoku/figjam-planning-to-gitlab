import { useState, useCallback } from "react";
import { toast } from "sonner";
// FigmaStickyNote import is no longer needed here
import { EditableIssueData } from "@/app/components/bridge/EditableIssueTable"; // Import the edited issue data type

// Re-define or import GitLabLabel type
interface GitLabLabel {
  id: string;
  title: string;
  color: string; // Keep color if needed for UI, otherwise simplify
  description: string; // Keep description if needed
}

export function useGitLabIntegration(
  editedIssueData: EditableIssueData[], // Accept edited data directly
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
    if (editedIssueData.length === 0) {
      toast.error("No Issues to Register", {
        description: "No selected sticky notes are ready for registration.",
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
    // No need to filter here, we already have the data to register
    let successCount = 0;
    let errorCount = 0;

    for (const issue of editedIssueData) {
      // Iterate over the edited data
      try {
        // Use data from the edited issue object
        const noteId = issue.id;
        const title = issue.title;
        const description = issue.description;
        const res = await fetch("/api/gitlab/issues", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: title, // Use edited title
            description: `${description}\n\n---\n_Imported from FigJam: [${issue.originalText.substring(
              0,
              30
            )}...](https://www.figma.com/file/${fileKey}?node-id=${noteId})_`, // Use edited description + link
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
  }, [editedIssueData, fileKey, selectedGitlabLabelIds]); // Update dependencies

  return {
    gitlabLabels,
    fetchGitlabLabels,
    selectedGitlabLabelIds,
    setSelectedGitlabLabelIds,
    handleCreateIssues,
    isCreatingIssues,
  };
}

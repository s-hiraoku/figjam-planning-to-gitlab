"use client"; // This component needs client-side interactivity

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner"; // Import toast from sonner
import { StickyNoteList } from "components/sticky-notes/sticky-note-list"; // Import the list

import { FigmaStickyNote } from "types/figma";
import { extractFileKey } from "@/lib/utils";

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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [gitlabLabels, setGitlabLabels] = useState<GitLabLabel[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedGitlabLabels, setSelectedGitlabLabels] = useState<string[]>(
    []
  );

  const extractFileKey = (url: string): string | null => {
    try {
      const urlParts = new URL(url);
      // Example URL: https://www.figma.com/file/FILE_KEY/File-Name?...
      const match = urlParts.pathname.match(/file\/([a-zA-Z0-9_-]+)([/|?]|$)/);
      return match ? match[1] : null;
    } catch (e: any) {
      // Suppress eslint error
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return null; // Invalid URL
    }
  };

  const handleUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = event.target.value;
    setFigmaUrl(newUrl);
    const extractedKey = extractFileKey(newUrl);
    setFileKey(extractedKey);

    if (!extractedKey && newUrl !== "") {
      toast.error("Invalid FigJam URL", {
        description: "Please enter a valid FigJam file URL.",
      });
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
    } catch (error: any) {
      // Suppress eslint error
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // TODO: Implement bulk issue creation
    console.log("Creating issues for selected notes:", selectedNotes);
    console.log("With labels:", selectedGitlabLabels);
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
            />
            {fileKey && (
              <p className="text-sm text-muted-foreground">
                Detected File Key: {fileKey}
              </p>
            )}
          </div>
          <Button onClick={fetchStickyNotes} disabled={!fileKey || isLoading}>
            {isLoading ? "Loading Notes..." : "Load Sticky Notes"}
          </Button>
        </CardContent>
      </Card>

      {/* Placeholder for Sticky Notes List */}
      {stickyNotes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>2. Select Sticky Notes</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Use the StickyNoteList component */}
            <StickyNoteList
              notes={stickyNotes}
              selectedNotes={selectedNotes}
              onSelectionChange={handleSelectionChange}
            />
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

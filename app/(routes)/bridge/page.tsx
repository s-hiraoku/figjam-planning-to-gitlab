"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Import Hooks
import { useFigmaData } from "@/app/hooks/useFigmaData";
import { useStickyNoteFilters } from "@/app/hooks/useStickyNoteFilters";
import { useGitLabIntegration } from "@/app/hooks/useGitLabIntegration";

// Import Components
import { Button } from "@/components/ui/button";
import { FigmaUrlSection } from "@/app/components/bridge/FigmaUrlSection";
import { StickyNoteFilterSection } from "@/app/components/bridge/StickyNoteFilterSection";
import { StickyNoteSelectionSection } from "@/app/components/bridge/StickyNoteSelectionSection";
import { GitLabConfigurationSection } from "@/app/components/bridge/GitLabConfigurationSection";
import { EditableIssueData } from "@/app/components/bridge/EditableIssueTable"; // Import the editable issue type
export default function BridgePage() {
  // --- State managed directly in the page ---
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]); // IDs of selected notes
  const [editedIssueData, setEditedIssueData] = useState<EditableIssueData[]>(
    []
  ); // State to hold data from the editable table
  const [showConfigSection, setShowConfigSection] = useState(false); // State to control visibility of section 3
  const [isEditMode, setIsEditMode] = useState(true); // State to control edit mode

  // --- Instantiate Hooks ---
  const {
    figmaUrl,
    handleUrlChange,
    fetchStickyNotes,
    isLoading: isFigmaLoading, // Rename to avoid conflict if GitLab hook adds loading state
    fileKey,
    urlError,
    stickyNotes, // Get notes from Figma hook
  } = useFigmaData();

  const {
    selectedSections,
    setSelectedSections,
    selectedColors,
    setSelectedColors,
    sectionOptions,
    colorOptions,
    filteredNotes, // Get filtered notes from filter hook
  } = useStickyNoteFilters(stickyNotes); // Pass raw notes to filter hook

  const {
    gitlabLabels,
    fetchGitlabLabels,
    selectedGitlabLabelIds,
    setSelectedGitlabLabelIds,
    handleCreateIssues,
    isCreatingIssues,
  } = useGitLabIntegration(editedIssueData, fileKey); // Pass edited data and fileKey to GitLab hook

  // --- Effects ---
  // Fetch labels when label selection UI is shown (first time notes are selected)
  useEffect(() => {
    if (selectedNotes.length > 0 && gitlabLabels.length === 0) {
      fetchGitlabLabels();
    }
    // Dependency array ensures this runs only when selectedNotes transitions from 0 to >0,
    // or if gitlabLabels changes (e.g., fetched successfully)
  }, [selectedNotes.length, gitlabLabels.length, fetchGitlabLabels]);

  // --- Event Handlers ---
  const handleSelectionChange = (selectedIds: string[]) => {
    setSelectedNotes(selectedIds);
  };

  // --- Render Logic ---
  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">FigJam to GitLab Bridge</h1>
        <Button variant="outline" onClick={() => setIsEditMode(!isEditMode)}>
          {isEditMode ? "Lock Settings" : "Edit Settings"}
        </Button>
      </div>

      {/* 1. Figma URL Section */}
      <FigmaUrlSection
        figmaUrl={figmaUrl}
        handleUrlChange={handleUrlChange}
        fetchStickyNotes={fetchStickyNotes}
        isLoading={isFigmaLoading}
        fileKey={fileKey}
        urlError={urlError}
        isEditMode={isEditMode}
      />

      {/* 2. Filter & Select Sticky Notes */}
      {stickyNotes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>2. Filter & Select Sticky Notes</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Filter UI */}
            <StickyNoteFilterSection
              sectionOptions={sectionOptions}
              selectedSections={selectedSections}
              onSectionChange={setSelectedSections}
              colorOptions={colorOptions}
              selectedColors={selectedColors}
              onColorChange={setSelectedColors}
              isEditMode={isEditMode}
            />
            {/* Sticky Notes List */}
            <StickyNoteSelectionSection
              filteredNotes={filteredNotes} // Pass filtered notes to list
              selectedNotes={selectedNotes}
              onSelectionChange={handleSelectionChange}
              isEditMode={isEditMode}
            />
            {/* Next Button */}
            <div className="flex justify-end mt-4">
              <Button
                disabled={selectedNotes.length === 0 || !isEditMode}
                onClick={() => {
                  setShowConfigSection(true);
                  setIsEditMode(false);
                }}
                type="button"
                variant="default"
              >
                Configure Issues
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 3. Configure & Register Issues */}
      {selectedNotes.length > 0 &&
        showConfigSection &&
        (() => {
          // Find the actual sticky note objects corresponding to the selected IDs
          const notesToRegister = filteredNotes.filter((note) =>
            selectedNotes.includes(note.id)
          );
          return (
            <GitLabConfigurationSection
              initialNotes={notesToRegister} // Pass the full note objects
              onIssueDataChange={setEditedIssueData} // Pass the setter for edited data
              gitlabLabels={gitlabLabels}
              selectedGitlabLabelIds={selectedGitlabLabelIds}
              onLabelChange={setSelectedGitlabLabelIds}
              handleCreateIssues={handleCreateIssues} // This will now use editedIssueData via the hook
              isCreatingIssues={isCreatingIssues}
              // selectedNotesCount prop is removed
            />
          );
        })()}
    </div>
  );
}

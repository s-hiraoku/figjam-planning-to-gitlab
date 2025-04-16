import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multiselect";
import { FigmaStickyNote } from "types/figma"; // Import FigmaStickyNote type
import { EditableIssueTable, EditableIssueData } from "./EditableIssueTable"; // Import the new table component and its data type

// Define the option type locally as it's not exported
interface MultiSelectOption {
  label: string;
  value: string;
  color?: string; // Keep color if needed, though GitLab labels might not use it here
}

// Define GitLabLabel type locally or import if available globally
export interface GitLabLabel {
  id: string;
  title: string;
  // Add other properties if needed by the MultiSelect mapping
}

interface GitLabConfigurationSectionProps {
  initialNotes: FigmaStickyNote[]; // Receive the actual notes
  onIssueDataChange: (updatedIssues: EditableIssueData[]) => void; // Callback to update parent state
  gitlabLabels: GitLabLabel[];
  selectedGitlabLabelIds: string[];
  onLabelChange: (selected: string[]) => void;
  handleCreateIssues: () => Promise<void>;
  isCreatingIssues: boolean;
  // selectedNotesCount is removed
}

export function GitLabConfigurationSection({
  initialNotes,
  onIssueDataChange,
  gitlabLabels,
  selectedGitlabLabelIds,
  onLabelChange,
  handleCreateIssues,
  isCreatingIssues,
}: GitLabConfigurationSectionProps) {
  const gitlabLabelOptions: MultiSelectOption[] = gitlabLabels.map((label) => ({
    label: label.title,
    value: label.id,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>3. Configure & Register Issues</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* GitLab Label Selection */}
        <MultiSelect
          options={gitlabLabelOptions}
          selected={selectedGitlabLabelIds}
          onChange={onLabelChange}
          placeholder="Select labels to add (optional)"
          label="GitLab Labels"
        />
        {/* Editable Issue Table */}
        <EditableIssueTable
          initialNotes={initialNotes}
          onIssueDataChange={onIssueDataChange}
          gitlabLabels={gitlabLabels}
          selectedGitlabLabelIds={selectedGitlabLabelIds}
        />
        {/* Register Button */}
        <Button
          onClick={handleCreateIssues}
          disabled={initialNotes.length === 0 || isCreatingIssues} // Disable based on initialNotes length
          variant="default"
        >
          {isCreatingIssues
            ? "Registering Issues..."
            : "Register Selected as GitLab Issues"}
        </Button>
      </CardContent>
    </Card>
  );
}

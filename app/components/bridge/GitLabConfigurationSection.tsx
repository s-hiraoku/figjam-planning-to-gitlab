import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multiselect";
import type { FigmaStickyNote } from "types/figma"; // Import FigmaStickyNote type
import { EditableIssueTable } from "./EditableIssueTable/EditableIssueTable"; // Import the new table component
import type { EditableIssueData } from "./EditableIssueTable";
import { useAtom } from "jotai";
import { editedIssuesAtom } from "@/app/atoms/bridgeAtoms";

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
}

interface GitLabConfigurationSectionProps {
  onIssueDataChange: (updatedIssues: EditableIssueData[]) => void; // Callback to update parent state
  gitlabLabels: GitLabLabel[];
  selectedGitlabLabelIds: string[];
  onLabelChange: (selected: string[]) => void;
  handleCreateIssues: () => Promise<void>;
  isCreatingIssues: boolean;
}

export function GitLabConfigurationSection({
  onIssueDataChange,
  gitlabLabels,
  selectedGitlabLabelIds,
  onLabelChange,
  handleCreateIssues,
  isCreatingIssues,
}: GitLabConfigurationSectionProps) {
  const [editedIssues] = useAtom(editedIssuesAtom);

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
          onIssueDataChange={onIssueDataChange}
          gitlabLabels={gitlabLabels}
          selectedGitlabLabelIds={selectedGitlabLabelIds}
        />
        {/* Register Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleCreateIssues}
            disabled={editedIssues.length === 0 || isCreatingIssues} // Disable based on initialNotes length
            variant="default"
          >
            {isCreatingIssues
              ? "Registering Issues..."
              : "Register Selected as GitLab Issues"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MultiSelect } from "@/components/ui/multiselect";

// Define the option type locally as it's not exported
interface MultiSelectOption {
  label: string;
  value: string;
  color?: string; // Keep color if needed, though GitLab labels might not use it here
}

// Define GitLabLabel type locally or import if available globally
interface GitLabLabel {
  id: string;
  title: string;
  // Add other properties if needed by the MultiSelect mapping
}

interface GitLabConfigurationSectionProps {
  gitlabLabels: GitLabLabel[];
  selectedGitlabLabelIds: string[];
  onLabelChange: (selected: string[]) => void;
  handleCreateIssues: () => Promise<void>;
  isCreatingIssues: boolean;
  selectedNotesCount: number;
}

export function GitLabConfigurationSection({
  gitlabLabels,
  selectedGitlabLabelIds,
  onLabelChange,
  handleCreateIssues,
  isCreatingIssues,
  selectedNotesCount,
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
        {/* Confirmation/Preview */}
        <p className="text-sm text-muted-foreground">
          {selectedNotesCount} sticky note(s) selected.
        </p>
        {/* GitLab Label Selection */}
        <MultiSelect
          options={gitlabLabelOptions}
          selected={selectedGitlabLabelIds}
          onChange={onLabelChange}
          placeholder="Select labels to add (optional)"
          label="GitLab Labels"
        />
        {/* Register Button */}
        <Button
          onClick={handleCreateIssues}
          disabled={selectedNotesCount === 0 || isCreatingIssues}
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

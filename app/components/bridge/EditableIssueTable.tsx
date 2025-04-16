import React, { useState, useEffect } from "react";
import { GitLabLabel } from "./GitLabConfigurationSection";
import { FigmaStickyNote } from "types/figma";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Assuming a table component exists or can be added

// Define the structure for editable issue data
export interface EditableIssueData {
  id: string; // Corresponds to FigmaStickyNote id
  title: string;
  description: string;
  originalText: string; // Keep original for reference
}

interface EditableIssueTableProps {
  initialNotes: FigmaStickyNote[];
  onIssueDataChange: (updatedIssues: EditableIssueData[]) => void;
  gitlabLabels: GitLabLabel[];
  selectedGitlabLabelIds: string[];
}

export function EditableIssueTable({
  initialNotes,
  onIssueDataChange,
  gitlabLabels,
  selectedGitlabLabelIds,
}: EditableIssueTableProps) {
  const [editingCell, setEditingCell] = useState<{
    rowIndex: number;
    colKey: keyof EditableIssueData;
  } | null>(null);

  // Initialize issue data from initialNotes
  const initialIssueData = initialNotes.map((note) => {
    const textContent = note.characters || note.name || "";
    // Basic logic: Use first line as title, rest as description
    const lines = textContent.split("\\n"); // Figma uses \n for newlines in sticky text
    const title = lines[0] || "Untitled Issue";
    const description = lines.slice(1).join("\\n");
    return {
      id: note.id,
      title: title,
      description: description,
      originalText: textContent,
    };
  });

  const [editedIssues, setEditedIssues] =
    useState<EditableIssueData[]>(initialIssueData);

  // Update parent of initial state
  useEffect(() => {
    onIssueDataChange(initialIssueData);
  }, []);

  const handleCellClick = (
    rowIndex: number,
    colKey: keyof EditableIssueData
  ) => {
    if (colKey === "title" || colKey === "description") {
      setEditingCell({ rowIndex, colKey });
    }
  };

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    rowIndex: number,
    colKey: keyof EditableIssueData
  ) => {
    const updatedIssues = editedIssues.map((issue, index) => {
      if (index === rowIndex) {
        return { ...issue, [colKey]: event.target.value };
      }
      return issue;
    });
    setEditedIssues(updatedIssues);
    // Debounced update could be added here if needed
    onIssueDataChange(updatedIssues); // Notify parent immediately for now
  };

  const handleInputBlur = () => {
    setEditingCell(null);
    // Potentially trigger final validation or save action here if needed
  };

  const renderCellContent = (
    issue: EditableIssueData,
    rowIndex: number,
    colKey: keyof EditableIssueData
  ) => {
    if (editingCell?.rowIndex === rowIndex && editingCell?.colKey === colKey) {
      if (colKey === "description") {
        return (
          <Textarea
            value={issue[colKey]}
            onChange={(e) => handleInputChange(e, rowIndex, colKey)}
            onBlur={handleInputBlur}
            autoFocus
            className="w-full h-24" // Adjust size as needed
          />
        );
      } else {
        // title
        return (
          <Input
            type="text"
            value={issue[colKey]}
            onChange={(e) => handleInputChange(e, rowIndex, colKey)}
            onBlur={handleInputBlur}
            autoFocus
            className="w-full"
          />
        );
      }
    }
    // Display newline characters correctly in non-editing mode for description
    return colKey === "description" ? (
      <pre className="whitespace-pre-wrap text-sm">
        {issue[colKey] || "(empty)"}
      </pre>
    ) : (
      issue[colKey] || "(empty)"
    );
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Edit Issue Details:</p>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[25%]">Title</TableHead>
              <TableHead className="w-[30%]">Description</TableHead>
              <TableHead className="w-[20%]">Sticky Note Content</TableHead>
              <TableHead className="w-[25%]">GitLab Labels</TableHead>
              {/* <TableHead className="w-[15%] text-xs text-muted-foreground">
                Original Text
              </TableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {editedIssues.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center text-muted-foreground"
                >
                  No sticky notes selected for registration.
                </TableCell>
              </TableRow>
            ) : (
              editedIssues.map((issue, rowIndex) => (
                <TableRow key={issue.id}>
                  <TableCell
                    onClick={() => handleCellClick(rowIndex, "title")}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    {renderCellContent(issue, rowIndex, "title")}
                  </TableCell>
                  <TableCell
                    onClick={() => handleCellClick(rowIndex, "description")}
                    className="cursor-pointer hover:bg-muted/50"
                  >
                    {renderCellContent(issue, rowIndex, "description")}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    <pre className="whitespace-pre-wrap">
                      {issue.originalText}
                    </pre>
                  </TableCell>
                  <TableCell>
                    {selectedGitlabLabelIds
                      .map((labelId) => {
                        const label = gitlabLabels.find(
                          (label) => label.id === labelId
                        );
                        return label ? label.title : null;
                      })
                      .filter(Boolean) // Remove null values (labels not found)
                      .join(", ") || "(none)"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useCallback, useMemo } from "react";
import type { GitLabLabel } from "./GitLabConfigurationSection";
import type { FigmaStickyNote } from "types/figma";
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

// Simple debounce function - using Function type as a broad base
function debounce<F extends (...args: Parameters<F>) => ReturnType<F>>(
  func: F,
  waitFor: number
) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<F>): void => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => func(...args), waitFor);
  };
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

  // Debounce the callback to the parent
  const debouncedOnIssueDataChange = useMemo(
    () => debounce(onIssueDataChange, 300),
    [onIssueDataChange]
  );

  // // Update the editedIssues state when initialNotes change (Hand-coded by　hiraoku)
  const handleCellClick = useCallback(
    (rowIndex: number, colKey: keyof EditableIssueData) => {
      if (colKey === "title" || colKey === "description") {
        setEditingCell({ rowIndex, colKey });
      }
    },
    []
  );

  const handleInputChange = useCallback(
    (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      rowIndex: number,
      colKey: keyof EditableIssueData
    ) => {
      const newValue = event.target.value;
      // Use functional update for efficiency
      setEditedIssues((prevIssues) => {
        const updatedIssues = [...prevIssues]; // Create a mutable copy
        // Ensure the row exists before trying to update
        if (updatedIssues[rowIndex]) {
          updatedIssues[rowIndex] = {
            ...updatedIssues[rowIndex],
            [colKey]: newValue,
          };
        }
        // Call the debounced function with the latest state
        debouncedOnIssueDataChange(updatedIssues);
        return updatedIssues; // Return the new state
      });
    },
    [debouncedOnIssueDataChange] // Dependency for useCallback
  );

  const handleInputBlur = useCallback(() => {
    setEditingCell(null);
    // Potentially trigger final validation or save action here if needed
  }, []);

  // Memoize the label lookup map
  const gitlabLabelMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const label of gitlabLabels) {
      // Use for...of loop
      map.set(label.id, label.title);
    }
    return map;
  }, [gitlabLabels]);

  // Memoized Row Component
  const MemoizedTableRow = React.memo(
    ({
      issue,
      rowIndex,
      editingCell,
      gitlabLabelMap,
      selectedGitlabLabelIds,
      handleCellClick,
      handleInputChange,
      handleInputBlur,
    }: {
      issue: EditableIssueData;
      rowIndex: number;
      editingCell: { rowIndex: number; colKey: keyof EditableIssueData } | null;
      gitlabLabelMap: Map<string, string>;
      selectedGitlabLabelIds: string[];
      handleCellClick: (
        rowIndex: number,
        colKey: keyof EditableIssueData
      ) => void;
      handleInputChange: (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        rowIndex: number,
        colKey: keyof EditableIssueData
      ) => void;
      handleInputBlur: () => void;
    }) => {
      const renderCellContent = (
        issue: EditableIssueData,
        rowIndex: number,
        colKey: keyof EditableIssueData
      ) => {
        if (
          editingCell?.rowIndex === rowIndex &&
          editingCell?.colKey === colKey
        ) {
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
          }
          // title (No else needed as previous branch returns)
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
          // Removed unnecessary else block
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

      const displayedLabels =
        selectedGitlabLabelIds
          .map((labelId) => gitlabLabelMap.get(labelId))
          .filter((labelName): labelName is string => !!labelName) // Filter out undefined/null and type guard
          .join(", ") || "(none)";

      return (
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
            <pre className="whitespace-pre-wrap">{issue.originalText}</pre>
          </TableCell>
          <TableCell>{displayedLabels}</TableCell>
        </TableRow>
      );
    }
  );
  MemoizedTableRow.displayName = "MemoizedTableRow"; // Add display name for DevTools

  // Removed the broken handleCellClick declaration block entirely.
  // The correct one is defined above using useCallback.

  // Removed original handleInputChange, handleInputBlur, renderCellContent as they are now inside MemoizedTableRow or handled by useCallback hooks

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
                <MemoizedTableRow
                  key={issue.id} // Key should be on the actual component being mapped
                  issue={issue}
                  rowIndex={rowIndex}
                  editingCell={editingCell}
                  gitlabLabelMap={gitlabLabelMap}
                  selectedGitlabLabelIds={selectedGitlabLabelIds}
                  handleCellClick={handleCellClick}
                  handleInputChange={handleInputChange}
                  handleInputBlur={handleInputBlur}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

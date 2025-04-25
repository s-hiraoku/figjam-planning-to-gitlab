import React from "react";

import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import type { EditableIssueData } from "./interfaces";

// セル描画時はローカル値を優先
export const MemoizedTableRow = React.memo(
  ({
    issue,
    rowIndex,
    editingCell,
    gitlabLabelMap,
    selectedGitlabLabelIds,
    handleCellClick,
    handleInputChange,
    handleInputBlur,
    currentEditValue, // Pass down current edit value (destructured)
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
      // Updated signature
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
    handleInputBlur: () => void;
    currentEditValue: string | null; // Correct prop type definition
  }) => {
    const renderCellContent = (
      issue: EditableIssueData,
      rowIndex: number,
      colKey: keyof EditableIssueData
    ) => {
      const isEditing =
        editingCell?.rowIndex === rowIndex && editingCell?.colKey === colKey;

      if (isEditing) {
        if (colKey === "description") {
          return (
            <Textarea
              value={currentEditValue ?? ""} // Use local edit state value
              onChange={handleInputChange} // Use updated handler
              onBlur={handleInputBlur}
              autoFocus
              className="w-full h-24"
            />
          );
        }
        return (
          <Input
            type="text"
            value={currentEditValue ?? ""} // Use local edit state value
            onChange={handleInputChange} // Use updated handler
            onBlur={handleInputBlur}
            autoFocus
            className="w-full"
          />
        );
      }
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

import { memo, useState, useCallback, useMemo } from "react";
import type { GitLabLabel } from "../GitLabConfigurationSection";
import type { FigmaStickyNote } from "types/figma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Assuming a table component exists or can be added
import { useAtom } from "jotai";
import { editedIssuesAtom } from "@/app/atoms/bridgeAtoms";
import type { EditableIssueData } from "./interfaces";
import { MemoizedTableRow } from "./MemorizedTableRow";

interface EditableIssueTableProps {
  onIssueDataChange: (updatedIssues: EditableIssueData[]) => void;
  gitlabLabels: GitLabLabel[];
  selectedGitlabLabelIds: string[];
}

export const EditableIssueTable = memo(function EditableIssueTable({
  onIssueDataChange,
  gitlabLabels,
  selectedGitlabLabelIds,
}: EditableIssueTableProps) {
  const [editedIssues, setEditedIssues] = useAtom(editedIssuesAtom);
  const [editingCell, setEditingCell] = useState<{
    rowIndex: number;
    colKey: keyof EditableIssueData;
  } | null>(null);
  const [currentEditValue, setCurrentEditValue] = useState<string | null>(null); // State for the currently edited cell's value

  // 編集開始
  const handleCellClick = useCallback(
    (rowIndex: number, colKey: keyof EditableIssueData) => {
      if (colKey === "title" || colKey === "description") {
        const issueToEdit = editedIssues[rowIndex];
        if (issueToEdit) {
          setEditingCell({ rowIndex, colKey });
          setCurrentEditValue(issueToEdit[colKey]); // Initialize local edit state
        }
      }
    },
    [editedIssues]
  );

  // Input change handler - updates only the local edit state
  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setCurrentEditValue(event.target.value);
  };

  // Blur handler - updates global state and notifies parent
  const handleInputBlur = useCallback(() => {
    if (editingCell !== null && currentEditValue !== null) {
      const { rowIndex, colKey } = editingCell;
      let updatedIssuesList: EditableIssueData[] = []; // To store the final list

      setEditedIssues((prevIssues) => {
        updatedIssuesList = prevIssues.map((issue, idx) => {
          if (idx === rowIndex) {
            // Ensure the update uses the final value from local state
            return { ...issue, [colKey]: currentEditValue };
          }
          return issue;
        });
        // Notify parent with the updated list *after* state update
        onIssueDataChange(updatedIssuesList);
        return updatedIssuesList; // Return the updated list for the atom
      });
    }
    // Reset editing state regardless of whether an update occurred
    setEditingCell(null);
    setCurrentEditValue(null);
  }, [editingCell, currentEditValue, setEditedIssues, onIssueDataChange]);

  // Memoize the label lookup map
  const gitlabLabelMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const label of gitlabLabels) {
      // Use for...of loop
      map.set(label.id, label.title);
    }
    return map;
  }, [gitlabLabels]);

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
                  colSpan={4} // Adjusted colSpan to 4
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
                  currentEditValue={
                    editingCell?.rowIndex === rowIndex ? currentEditValue : null
                  } // Pass currentEditValue only to the editing row
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
});

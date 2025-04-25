// Define the structure for editable issue data
export interface EditableIssueData {
  id: string; // Corresponds to FigmaStickyNote id
  title: string;
  description: string;
  originalText: string; // Keep original for reference
}

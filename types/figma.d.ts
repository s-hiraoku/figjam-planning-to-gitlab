// types/figma.d.ts
export interface FigmaStickyNote {
  id: string;
  name: string; // Usually the text content
  characters?: string; // Alternative text content property
  fills?: Array<{ color: { r: number; g: number; b: number; a: number } }>;
  // Add other relevant properties like position, size, etc.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

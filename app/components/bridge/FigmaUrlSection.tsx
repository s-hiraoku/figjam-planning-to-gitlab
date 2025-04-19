import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FigmaPreview } from "@/components/figma-viewer/FigmaPreview";

interface FigmaUrlSectionProps {
  figmaUrl: string;
  handleUrlChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  fetchStickyNotes: () => Promise<void>;
  isLoading: boolean;
  fileKey: string | null;
  urlError: string | null;
  isEditMode: boolean;
}

export function FigmaUrlSection({
  figmaUrl,
  handleUrlChange,
  fetchStickyNotes,
  isLoading,
  fileKey,
  urlError,
  isEditMode,
}: FigmaUrlSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>1. Enter FigJam URL</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="figma-url">FigJam File URL</Label>
          <Input
            id="figma-url"
            type="url"
            placeholder="https://www.figma.com/file/..."
            value={figmaUrl}
            onChange={handleUrlChange}
            disabled={!isEditMode || isLoading}
            aria-invalid={!!urlError}
            aria-describedby={urlError ? "figma-url-error" : undefined}
          />
          {urlError && (
            <p id="figma-url-error" className="text-sm text-red-600">
              {urlError}
            </p>
          )}
          {fileKey && !urlError && (
            <p className="text-sm text-muted-foreground">
              Detected File Key: {fileKey}
            </p>
          )}
        </div>
        <Button
          onClick={fetchStickyNotes}
          disabled={!isEditMode || !fileKey || isLoading || !!urlError}
        >
          {isLoading ? "Loading Notes..." : "Load Sticky Notes"}
        </Button>
      </CardContent>
      {/* Figma Preview Accordion */}
      {figmaUrl &&
        !urlError &&
        fileKey && ( // Only show preview if URL is valid and key exists
          <div className="mb-4 px-6">
            <details className="rounded border bg-white">
              <summary className="cursor-pointer px-4 py-2 text-sm font-medium select-none">
                Figma Preview (click to expand/collapse)
              </summary>
              <div className="p-2">
                <FigmaPreview url={figmaUrl} />
              </div>
            </details>
          </div>
        )}
    </Card>
  );
}

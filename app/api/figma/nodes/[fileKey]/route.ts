/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

// Define a basic type for the Figma Node structure
// Adjust this based on the actual structure needed
interface FigmaNode {
  document: {
    id: string;
    type: string;
    // Add other relevant properties here
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any; // Allow other properties
  };
  // Add other top-level properties if needed
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface StickyNotesMap {
  [nodeId: string]: FigmaNode;
}

export async function GET(
  request: Request,
  context: { params: { fileKey: string } }
) {
  const { fileKey } = await context.params;
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get("ids"); // Comma-separated node IDs
  const figmaToken = process.env.FIGMA_ACCESS_TOKEN;

  if (!fileKey) {
    return NextResponse.json(
      { error: "FigJam file key is required" },
      { status: 400 }
    );
  }

  if (!figmaToken) {
    return NextResponse.json(
      { error: "FigJam access token is not configured" },
      { status: 500 }
    );
  }

  // If "ids" is provided, fetch only those nodes
  if (ids) {
    const figmaApiUrl = `https://api.figma.com/v1/files/${fileKey}/nodes?ids=${ids}`;
    try {
      const response = await fetch(figmaApiUrl, {
        headers: {
          "X-Figma-Token": figmaToken,
        } as HeadersInit,
      });

      if (!response.ok) {
        const errorData = await response.json();
        return NextResponse.json(
          {
            error: `Failed to fetch FigJam nodes: ${
              errorData.err || response.statusText
            }`,
          },
          { status: response.status }
        );
      }

      const data = await response.json();

      // Filter for sticky notes (type: 'STICKY')
      const stickyNotes: StickyNotesMap = {};
      if (data.nodes) {
        for (const nodeId in data.nodes) {
          const nodeData = data.nodes[nodeId];
          if (nodeData?.document?.type === "STICKY") {
            stickyNotes[nodeId] = nodeData;
          }
        }
      }

      // Return only sticky notes
      return NextResponse.json({ ...data, nodes: stickyNotes });
    } catch {
      return NextResponse.json(
        { error: "Internal server error while fetching FigJam nodes" },
        { status: 500 }
      );
    }
  }

  // If "ids" is not provided, fetch the full file and extract all nodes
  const figmaApiUrl = `https://api.figma.com/v1/files/${fileKey}`;
  try {
    const response = await fetch(figmaApiUrl, {
      headers: {
        "X-Figma-Token": figmaToken,
      } as HeadersInit,
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        {
          error: `Failed to fetch FigJam file: ${
            errorData.err || response.statusText
          }`,
        },
        { status: response.status }
      );
    }
    const data = await response.json();

    // Extract all nodes from the file
    // Figma file response: { document: { ... }, components: { ... }, ... }
    // We'll flatten the document tree to collect all nodes of type 'STICKY'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function collectStickyNodes(
      node: FigmaNode | { [key: string]: any },
      result: StickyNotesMap,
      parentSectionName: string = "セクションなし"
    ) {
      let currentSectionName = parentSectionName;
      if (node.type === "SECTION" && node.name) {
        currentSectionName = node.name;
      }
      if (node.type === "STICKY") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const stickyNode = node as {
          id: string;
          type: string;
          [key: string]: any;
        };
        // Attach sectionName to the sticky note object
        result[stickyNode.id] = {
          document: stickyNode,
          sectionName: currentSectionName,
          ...stickyNode, // Include the sticky note's properties in the result
        };
      }
      if (node.children && Array.isArray(node.children)) {
        for (const child of node.children) {
          collectStickyNodes(child, result, currentSectionName);
        }
      }
    }

    const stickyNotes: StickyNotesMap = {};
    if (data.document) {
      collectStickyNodes(data.document, stickyNotes, "セクションなし");
    }

    return NextResponse.json({ ...data, nodes: stickyNotes });
  } catch {
    return NextResponse.json(
      { error: "Internal server error while fetching FigJam file" },
      { status: 500 }
    );
  }
}

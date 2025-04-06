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
  { params }: { params: { fileKey: string } }
) {
  const fileKey = params.fileKey;
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

  // Construct the API URL
  let figmaApiUrl = `https://api.figma.com/v1/files/${fileKey}/nodes`;
  if (ids) {
    figmaApiUrl += `?ids=${ids}`;
  }

  try {
    const response = await fetch(figmaApiUrl, {
      headers: {
        "X-Figma-Token": figmaToken,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("FigJam API Error fetching nodes:", errorData);
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
    const stickyNotes: StickyNotesMap = {}; // Use the defined type
    if (data.nodes) {
      for (const nodeId in data.nodes) {
        const nodeData = data.nodes[nodeId]; // Assign to variable first
        if (nodeData?.document?.type === "STICKY") {
          stickyNotes[nodeId] = nodeData; // Assign the variable
        }
      }
    }

    // Return only sticky notes
    return NextResponse.json({ ...data, nodes: stickyNotes });
  } catch (error) {
    console.error("Error fetching FigJam nodes:", error);
    return NextResponse.json(
      { error: "Internal server error while fetching FigJam nodes" },
      { status: 500 }
    );
  }
}

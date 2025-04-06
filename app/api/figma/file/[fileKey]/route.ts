import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { fileKey: string } }
) {
  const fileKey = params.fileKey;
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

  const figmaApiUrl = `https://api.figma.com/v1/files/${fileKey}`;

  try {
    const response = await fetch(figmaApiUrl, {
      headers: {
        "X-Figma-Token": figmaToken,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("FigJam API Error:", errorData);
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
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching FigJam file:", error);
    return NextResponse.json(
      { error: "Internal server error while fetching FigJam file" },
      { status: 500 }
    );
  }
}

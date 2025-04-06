import { NextResponse } from "next/server";

const getGitlabApiUrl = () => {
  const instanceUrl = process.env.GITLAB_INSTANCE_URL;
  return instanceUrl
    ? `${instanceUrl}/api/graphql`
    : "https://gitlab.com/api/graphql";
};

const GET_LABELS_QUERY = `
  query getProjectLabels($projectPath: ID!) {
    project(fullPath: $projectPath) {
      labels {
        nodes {
          id
          title
          color
          description
        }
      }
    }
  }
`;

// Disable eslint rule for unused request parameter
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: Request) {
  const gitlabToken = process.env.GITLAB_ACCESS_TOKEN;
  const projectId = process.env.GITLAB_PROJECT_ID; // Using Project ID directly

  if (!gitlabToken) {
    return NextResponse.json(
      { error: "GitLab access token is not configured" },
      { status: 500 }
    );
  }
  if (!projectId) {
    return NextResponse.json(
      { error: "GitLab project ID is not configured" },
      { status: 500 }
    );
  }

  const gitlabApiUrl = getGitlabApiUrl();

  try {
    // Note: GitLab GraphQL uses Project ID (e.g., "gid://gitlab/Project/123") or full path
    // We need to construct the GID from the Project ID
    const projectGid = `gid://gitlab/Project/${projectId}`;

    const response = await fetch(gitlabApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${gitlabToken}`,
      },
      body: JSON.stringify({
        query: GET_LABELS_QUERY,
        variables: { projectPath: projectGid }, // Use GID here
      }),
    });

    if (!response.ok) {
      const errorData = await response.text(); // GraphQL might return text errors
      console.error(
        "GitLab API Error fetching labels:",
        response.status,
        errorData
      );
      return NextResponse.json(
        {
          error: `Failed to fetch GitLab labels: ${response.statusText}`,
          details: errorData,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    if (data.errors) {
      console.error("GitLab GraphQL Errors:", data.errors);
      return NextResponse.json(
        { error: "GitLab GraphQL query returned errors", details: data.errors },
        { status: 400 } // Or 500 depending on error type
      );
    }

    const labels = data?.data?.project?.labels?.nodes || [];
    return NextResponse.json({ labels });
  } catch (error) {
    console.error("Error fetching GitLab labels:", error);
    return NextResponse.json(
      { error: "Internal server error while fetching GitLab labels" },
      { status: 500 }
    );
  }
}

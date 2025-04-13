import { NextResponse } from "next/server";

const getGitlabApiUrl = () => {
  const instanceUrl = process.env.GITLAB_INSTANCE_URL;
  return instanceUrl
    ? `${instanceUrl}/api/graphql`
    : "https://gitlab.com/api/graphql";
};

// Define the structure of the expected request body
interface CreateIssueRequestBody {
  title: string;
  description: string;
  labels?: string[]; // Array of label titles
}

const CREATE_ISSUE_MUTATION = `
  mutation createIssue($projectPath: ID!, $title: String!, $description: String, $labelIds: [LabelID!]) {
    createIssue(input: {projectPath: $projectPath, title: $title, description: $description, labelIds: $labelIds}) {
      issue {
        id
        iid
        title
        webUrl
      }
      errors
    }
  }
`;

export async function POST(request: Request) {
  const gitlabToken = process.env.GITLAB_ACCESS_TOKEN;
  const projectPath = process.env.GITLAB_PROJECT_PATH;

  if (!gitlabToken) {
    return NextResponse.json(
      { error: "GitLab access token is not configured" },
      { status: 500 }
    );
  }
  if (!projectPath) {
    return NextResponse.json(
      { error: "GitLab project path is not configured" },
      { status: 500 }
    );
  }

  let requestBody: CreateIssueRequestBody;
  try {
    requestBody = await request.json();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { title, description } = requestBody;

  if (!title) {
    return NextResponse.json(
      { error: "Issue title is required" },
      { status: 400 }
    );
  }

  const gitlabApiUrl = getGitlabApiUrl();

  try {
    const payload = {
      query: CREATE_ISSUE_MUTATION,
      variables: {
        projectPath: projectPath,
        title: title,
        description: description || "", // Ensure description is a string
        labelIds: [], // ラベル未対応の場合は空配列
      },
    };
    console.log("GitLab GraphQL payload:", JSON.stringify(payload, null, 2));
    const response = await fetch(gitlabApiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${gitlabToken}`,
      },
      body: JSON.stringify(payload),
    });

    const rawText = await response.text();
    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      data = null;
    }
    console.log("GitLab GraphQL response raw text:", rawText);
    console.log("GitLab GraphQL response parsed JSON:", data);

    if (!response.ok) {
      console.error(
        "GitLab API Error creating issue:",
        response.status,
        rawText
      );
      return NextResponse.json(
        {
          error: `Failed to create GitLab issue: ${response.statusText}`,
          details: rawText,
        },
        { status: response.status }
      );
    }

    if (data?.errors || data?.data?.createIssue?.errors?.length > 0) {
      const errors = data?.errors || data?.data?.createIssue?.errors;
      console.error("GitLab GraphQL Errors creating issue:", errors);
      return NextResponse.json(
        { error: "GitLab GraphQL mutation returned errors", details: errors },
        { status: 400 } // Or 500 depending on error type
      );
    }

    const createdIssue = data?.data?.createIssue?.issue;
    if (!createdIssue) {
      console.error("GitLab GraphQL mutation did not return the created issue");
      return NextResponse.json(
        { error: "Failed to retrieve created issue details from GitLab" },
        { status: 500 }
      );
    }

    return NextResponse.json({ issue: createdIssue }, { status: 201 }); // 201 Created
  } catch (error) {
    console.error("Error creating GitLab issue:", error);
    return NextResponse.json(
      { error: "Internal server error while creating GitLab issue" },
      { status: 500 }
    );
  }
}

# Figma-GitLab Integration

This project integrates Figma and GitLab, allowing users to plan and manage projects using sticky notes in Figma and synchronize them with GitLab issues.

## Features

- **Figma Integration:** Fetch data from Figma, display Figma content, and select sticky notes.
- **GitLab Integration:** Configure GitLab integration, create and manage GitLab issues, and use GitLab labels.
- **Sticky Note Filtering:** Filter sticky notes based on certain criteria.

## Getting Started

1.  **Clone the repository:**

    ```bash
    git clone <repository_url>
    cd figjam-planning-to-gitlab
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    # or
    bun install
    ```

3.  **Run the development server:**

    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    # or
    bun dev
    ```

4.  **Open the application in your browser:**

    Open [http://localhost:3000](http://localhost:3000) with your browser.

## Configuration

### Environment Variables

Before running the application, you need to set the following environment variables in a `.env` file:

- `GITLAB_ACCESS_TOKEN`: Your GitLab personal access token with `api` scope.
- `GITLAB_PROJECT_PATH`: The path to your GitLab project (e.g., `your-group/your-project`).
- `GITLAB_INSTANCE_URL` (optional): The URL of your GitLab instance. Defaults to `https://gitlab.com` if not provided.

### GitLab Integration

1.  Navigate to the "Bridge" page.
2.  Enter your GitLab project ID and personal access token.
3.  Click "Save Configuration".

### Figma Integration

1.  Enter your Figma file URL.

## Usage

1.  **Connect to Figma:** Enter your Figma file URL in the "Figma URL" section.
2.  **Select Sticky Notes:** Select the sticky notes you want to synchronize with GitLab issues.
3.  **Filter Sticky Notes:** Filter sticky notes based on labels or other criteria using the "Sticky Note Filter" section.
4.  **Create/Manage GitLab Issues:** Create new GitLab issues from selected sticky notes or manage existing issues in the "Configure & Register Issues" section.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

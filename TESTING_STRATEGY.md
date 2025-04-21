# Testing Strategy Report for figjam-planning-to-gitlab

## 1. Introduction

This report outlines a recommended testing strategy for the `figjam-planning-to-gitlab` project. The project is built with Next.js, React, and TypeScript, and currently lacks automated tests. Implementing a robust testing strategy is crucial for ensuring code quality, maintainability, and preventing regressions as the application evolves.

## 2. Recommended Tools

- **Test Runner & Framework:** **Vitest**
  - _Reasoning:_ Already present in `devDependencies`. It's fast, modern, supports TypeScript out-of-the-box, and offers Jest-compatible APIs, making it easy to adopt. It integrates well with Vite, which Next.js can leverage.
- **Component Testing:** **React Testing Library (RTL)** (`@testing-library/react`)
  - _Reasoning:_ The de-facto standard for testing React components. Encourages testing components in a way that resembles how users interact with them, focusing on behavior rather than implementation details. Works seamlessly with Vitest.
- **End-to-End (E2E) Testing:** **Cypress**
  - _Reasoning:_ Provides an excellent developer experience for writing, running, and debugging E2E tests. It runs directly in the browser, allowing for reliable testing of user flows. Playwright is a strong alternative, but Cypress is often considered slightly easier for teams new to E2E testing.
- **Mocking:** **Vitest's built-in mocking capabilities** (`vi.fn`, `vi.mock`)
  - _Reasoning:_ Vitest provides powerful and easy-to-use mocking features for isolating units of code and mocking dependencies like API calls or modules.

## 3. Recommended Directory Structure

- **Unit/Integration Tests:** Co-locate test files with the source code files they are testing.
  - Example: `app/components/bridge/FigmaUrlSection.tsx` would have a corresponding test file `app/components/bridge/FigmaUrlSection.spec.tsx`.
  - Use the `.spec.ts` or `.spec.tsx` suffix. _(Updated)_
  - _Reasoning:_ Makes tests easy to find and keeps related code together, improving maintainability.
- **E2E Tests:** Create a dedicated top-level directory for E2E tests.
  - Example: `cypress/` (if using Cypress) or `e2e/`.
  - _Reasoning:_ E2E tests operate at a higher level and often have their own configuration and helper files, justifying a separate directory.

## 4. Test Types and Priorities (Testing Trophy Model)

We recommend a balanced approach, prioritizing tests that provide the most value and confidence:

1.  **Integration Tests (Medium Priority, High Quantity):**
    - _Focus:_ Testing multiple units working together, such as components interacting, components fetching data via hooks, or API route handlers interacting with libraries.
    - _Tools:_ Vitest + RTL.
    - _Goal:_ Verify interactions between different parts of the application. This layer provides high confidence with reasonable effort.
2.  **Unit Tests (High Priority, Medium Quantity):**
    - _Focus:_ Testing individual functions, components, or hooks in isolation. Particularly important for complex logic, utility functions, and core business rules.
    - _Tools:_ Vitest (+ RTL for component rendering if needed, but focus on logic).
    - _Goal:_ Verify that individual pieces of code work correctly. Fast to run and pinpoint specific failures.
3.  **E2E Tests (Medium Priority, Low Quantity):**
    - _Focus:_ Testing critical user flows from end-to-end, simulating real user interactions in a browser. Examples: Submitting the Figma URL and seeing sticky notes, configuring GitLab and creating issues.
    - _Tools:_ Cypress.
    - _Goal:_ Verify that the application works as expected from a user's perspective across different parts of the system. They are slower and more brittle but provide the highest level of confidence for critical paths.

## 5. How to Test Specific Application Parts

- **UI Components (`app/components/`, `components/`):**
  - _Type:_ Primarily Integration Tests, some Unit Tests for complex internal logic.
  - _Tools:_ Vitest + RTL.
  - _Approach:_ Render the component, simulate user interactions (clicks, input changes), assert the rendered output and state changes. Mock props and dependencies (hooks, API calls) as needed using `vi.mock`. Test different states (loading, error, success).
- **API Routes (`app/api/`):**
  - _Type:_ Integration Tests.
  - _Tools:_ Vitest. Consider using Next.js test utilities or libraries like `supertest-fetch` for making requests.
  - _Approach:_ Mock external dependencies (Figma/GitLab clients). Send mock requests to the route handlers. Assert the response status code, headers, and body content. Test success cases, error handling, and input validation.
- **Hooks (`app/hooks/`):**
  - _Type:_ Unit/Integration Tests.
  - _Tools:_ Vitest + RTL (`renderHook`).
  - _Approach:_ Use `renderHook` to test the hook's logic in isolation. Assert its return values and test how it updates state in response to actions or effects. Mock any external dependencies or context values.
- **Utility Functions (`app/lib/`, `lib/`):**
  - _Type:_ Unit Tests.
  - _Tools:_ Vitest.
  - _Approach:_ Test pure functions with various inputs, including edge cases. Assert the return values.
- **Pages (`app/(routes)/`):**
  - _Type:_ Primarily covered by E2E tests and Integration tests of the components they use.
  - _Approach:_ Focus E2E tests on the user flows involving these pages. Integration tests should cover the main components rendered by the page. Avoid extensive page-level unit tests unless there's significant logic directly within the page component itself.

## 6. Initial Setup Steps (To be done in implementation phase)

1.  Install necessary dependencies: `@testing-library/react`, `@testing-library/jest-dom` (for additional matchers), `jsdom` (for Vitest DOM environment), `cypress`.
2.  Configure Vitest: Create a `vitest.config.ts` file to set up the testing environment (e.g., `jsdom`), global setup files (for RTL extensions), and path aliases if needed.
3.  Configure Cypress: Run `npx cypress open` to initialize the Cypress configuration files.
4.  Update `tsconfig.json`: Ensure necessary types for testing libraries are included.
5.  Add/Update `test` scripts in `package.json` for running different test types (e.g., `test:unit`, `test:e2e`).

## 7. Conclusion

This strategy provides a solid foundation for building a comprehensive test suite for the `figjam-planning-to-gitlab` project. Starting with integration tests for key components and unit tests for critical logic, followed by E2E tests for major user flows, will significantly improve the application's quality and developer confidence. Remember that testing is an ongoing process; the suite should evolve alongside the application.

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Link from "next/link"; // Import Link
import { Button } from "./button"; // Adjust the import path if necessary

describe("Button Component", () => {
  it("should render the button with default props", () => {
    render(<Button>Click Me</Button>);
    const buttonElement = screen.getByRole("button", { name: /click me/i });
    expect(buttonElement).toBeInTheDocument();
    expect(buttonElement).not.toBeDisabled();
  });

  it("should render children correctly", () => {
    render(
      <Button>
        <span>Inner Span</span>
      </Button>
    );
    const buttonElement = screen.getByRole("button");
    expect(buttonElement).toContainHTML("<span>Inner Span</span>");
  });

  it("should call onClick handler when clicked", () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click Handler Test</Button>);
    const buttonElement = screen.getByRole("button", {
      name: /click handler test/i,
    });
    fireEvent.click(buttonElement);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should be disabled when disabled prop is true", () => {
    render(<Button disabled>Disabled Button</Button>);
    const buttonElement = screen.getByRole("button", {
      name: /disabled button/i,
    });
    expect(buttonElement).toBeDisabled();
  });

  it("should apply variant classes correctly", () => {
    render(<Button variant="destructive">Destructive</Button>);
    const buttonElement = screen.getByRole("button", { name: /destructive/i });
    // Check for a class specific to the destructive variant (adjust class name if needed)
    expect(buttonElement).toHaveClass("bg-destructive");
  });

  it("should apply size classes correctly", () => {
    render(<Button size="lg">Large Button</Button>);
    const buttonElement = screen.getByRole("button", { name: /large button/i });
    // Check for a class specific to the large size (adjust class name if needed)
    expect(buttonElement).toHaveClass("h-10"); // Example class, verify actual class
  });

  it("should render as child when asChild prop is true", () => {
    // Use next/link's Link component for the asChild test
    render(
      <Button asChild>
        <Link href="/">Link Button</Link>
      </Button>
    );
    const linkElement = screen.getByRole("link", { name: /link button/i });
    expect(linkElement).toBeInTheDocument();
    expect(linkElement.tagName).toBe("A");
    // Check for button-like classes applied to the anchor
    expect(linkElement).toHaveClass("inline-flex"); // Example base class
  });
});

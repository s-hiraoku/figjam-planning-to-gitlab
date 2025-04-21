import { describe, it, expect } from "vitest";
import { extractFileKey } from "./utils";

describe("extractFileKey", () => {
  it("should extract the file key from a valid /file/ URL", () => {
    const url = "https://www.figma.com/file/abcdef12345/My-Design-File";
    expect(extractFileKey(url)).toBe("abcdef12345");
  });

  it("should extract the file key from a valid /board/ URL", () => {
    const url = "https://www.figma.com/board/ghijklm67890/My-FigJam-Board";
    expect(extractFileKey(url)).toBe("ghijklm67890");
  });

  it("should extract the file key when query parameters are present", () => {
    const url =
      "https://www.figma.com/file/abcdef12345/My-Design-File?node-id=1%3A2";
    expect(extractFileKey(url)).toBe("abcdef12345");
  });

  it("should return null for an invalid URL format", () => {
    const url = "not-a-valid-url";
    expect(extractFileKey(url)).toBeNull();
  });

  it("should return null for a URL without a file or board key", () => {
    const url = "https://www.figma.com/files/";
    expect(extractFileKey(url)).toBeNull();
  });

  it("should return null for a URL with a different path structure", () => {
    const url = "https://www.figma.com/community/file/opqrstuvwxyz";
    expect(extractFileKey(url)).toBeNull(); // Expect null as it doesn't match /file/ or /board/ directly after domain
  });

  it("should return null for an empty string", () => {
    const url = "";
    expect(extractFileKey(url)).toBeNull();
  });

  it("should handle URLs with trailing slashes", () => {
    const url = "https://www.figma.com/file/abcdef12345/";
    expect(extractFileKey(url)).toBe("abcdef12345");
  });
});

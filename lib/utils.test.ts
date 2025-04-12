import { expect, test } from "vitest";
import { extractFileKey } from "./utils"; // Adjust the import path

test("extractFileKey should extract the file key from a valid /file/ URL", () => {
  const url = "https://www.figma.com/file/FILE_KEY/File-Name?node-id=123%3A456";
  const fileKey = extractFileKey(url);
  expect(fileKey).toBe("FILE_KEY");
});

test("extractFileKey should extract the file key from a valid /board/ URL", () => {
  const url = "https://www.figma.com/board/BOARD_KEY/Board-Name?node-id=0-1";
  const fileKey = extractFileKey(url);
  expect(fileKey).toBe("BOARD_KEY");
});

test("extractFileKey should return null for an invalid Figma URL", () => {
  const url = "invalid-url";
  const fileKey = extractFileKey(url);
  expect(fileKey).toBe(null);
});

test("extractFileKey should handle /file/ URLs with trailing slashes", () => {
  const url = "https://www.figma.com/file/FILE_KEY/";
  const fileKey = extractFileKey(url);
  expect(fileKey).toBe("FILE_KEY");
});

test("extractFileKey should handle /board/ URLs with trailing slashes", () => {
  const url = "https://www.figma.com/board/BOARD_KEY/";
  const fileKey = extractFileKey(url);
  expect(fileKey).toBe("BOARD_KEY");
});

test("extractFileKey should handle /file/ URLs with query parameters after the file key", () => {
  const url =
    "https://www.figma.com/file/FILE_KEY/?param1=value1&param2=value2";
  const fileKey = extractFileKey(url);
  expect(fileKey).toBe("FILE_KEY");
});

test("extractFileKey should handle /board/ URLs with query parameters after the file key", () => {
  const url =
    "https://www.figma.com/board/BOARD_KEY/?param1=value1&param2=value2";
  const fileKey = extractFileKey(url);
  expect(fileKey).toBe("BOARD_KEY");
});

test("extractFileKey should return null for URLs without a file key", () => {
  const url = "https://www.figma.com/";
  const fileKey = extractFileKey(url);
  expect(fileKey).toBe(null);
});

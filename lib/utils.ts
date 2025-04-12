import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Export the function and suppress eslint
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const extractFileKey = (url: string): string | null => {
  try {
    const urlParts = new URL(url);
    // Handle both /file/KEY and /board/KEY URLs
    const match = urlParts.pathname.match(/\/(?:file|board)\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  } catch (e: any) {
    // Suppress eslint error
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return null; // Invalid URL
  }
};

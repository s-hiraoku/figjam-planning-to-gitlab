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
    // Example URL: https://www.figma.com/file/FILE_KEY/File-Name?...
    const match = urlParts.pathname.match(/file\/([a-zA-Z0-9_-]+)([/|?]|$)/);
    return match ? match[1] : null;
  } catch (e: any) {
    // Suppress eslint error
    return null; // Invalid URL
  }
};

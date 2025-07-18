import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { customAlphabet } from "nanoid";

export const nanoid = customAlphabet(
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  12,
);

export function absoluteUrl(path: string = "/") {
  path = path.startsWith("/") ? path : `/${path}`;

  return `${process.env.BETTER_AUTH_URL}${path}`;
}

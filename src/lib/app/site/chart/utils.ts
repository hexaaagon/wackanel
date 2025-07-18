/**
 * Chart utility functions for color generation and data processing
 */

/**
 * Generate vibrant colors that look good in light theme
 * Uses HSL color space to ensure consistent saturation and lightness
 */
export function generateColor(): string {
  const vibrantColors = [
    "#3B82F6",
    "#EF4444",
    "#10B981",
    "#F59E0B",
    "#8B5CF6",
    "#EC4899",
    "#06B6D4",
    "#84CC16",
    "#F97316",
    "#6366F1",
    "#14B8A6",
    "#F43F5E",
    "#A855F7",
    "#22C55E",
    "#FACC15",
  ];

  return vibrantColors[Math.floor(Math.random() * vibrantColors.length)];
}

/**
 * Generate a deterministic color based on project name
 * This ensures the same project always gets the same color
 */
export function generateColorForProject(projectName: string): string {
  const vibrantColors = [
    "#3B82F6",
    "#EF4444",
    "#10B981",
    "#F59E0B",
    "#8B5CF6",
    "#EC4899",
    "#06B6D4",
    "#84CC16",
    "#F97316",
    "#6366F1",
    "#14B8A6",
    "#F43F5E",
    "#A855F7",
    "#22C55E",
    "#FACC15",
  ];

  let hash = 0;
  for (let i = 0; i < projectName.length; i++) {
    const char = projectName.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  const index = Math.abs(hash) % vibrantColors.length;
  return vibrantColors[index];
}

/**
 * Generate a random vibrant color using HSL
 * Alternative approach if you want truly random colors
 */
export function generateRandomVibrantColor(): string {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 70 + Math.floor(Math.random() * 21);
  const lightness = 45 + Math.floor(Math.random() * 21);

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Format minutes into human-readable time string
 */
export function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  return `${mins}m`;
}

/**
 * Get "Others" color - consistent gray for the "Others" category
 */
export function getOthersColor(): string {
  return "#6B7280";
}

import type { Transcript } from "./types";

/**
 * Obtiene un preview limpio del contenido del transcript
 */
export function getContentPreview(transcript: Transcript): string {
  const content = transcript.content || "";

  // Remover markdown headers, bullets, etc.
  const cleaned = content
    .replace(/^#{1,6}\s+/gm, "") // Headers
    .replace(/^[-*]\s+/gm, "") // Bullets
    .replace(/\*\*(.*?)\*\*/g, "$1") // Bold
    .replace(/\[(.*?)\]\(.*?\)/g, "$1") // Links
    .trim();

  // Primeras 150 caracteres
  return cleaned.slice(0, 150) + (cleaned.length > 150 ? "..." : "");
}

/**
 * Colores para badges de proyectos
 */
const PROJECT_COLORS: Record<string, string> = {
  "Action Experience": "bg-blue-100 text-blue-800",
  Operations: "bg-green-100 text-green-800",
  "Action Colleague": "bg-purple-100 text-purple-800",
  "Newton AI": "bg-orange-100 text-orange-800",
};

/**
 * Obtiene la clase CSS para un badge de proyecto
 */
export function getProjectBadgeClass(projectName: string): string {
  return PROJECT_COLORS[projectName] || "bg-gray-100 text-gray-800";
}

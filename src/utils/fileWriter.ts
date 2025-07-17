import fs from "fs";
import path from "path";

/**
 * Crea un archivo con contenido, generando carpetas si es necesario.
 * @param filePath Ruta completa del archivo (incluye el nombre y extensión)
 * @param content Contenido a escribir
 */
export function writeFileRecursive(filePath: string, content: string): void {
  const dir = path.dirname(filePath);

  // Crea directorios recursivamente si no existen
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Escribe el archivo
  fs.writeFileSync(filePath, content, { encoding: "utf-8" });
}

/**
 * Verifica si un archivo ya existe.
 * @param filePath Ruta completa del archivo
 */
export function fileExists(filePath: string): boolean {
  return fs.existsSync(filePath);
}

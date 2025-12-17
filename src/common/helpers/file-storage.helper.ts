import { extname } from 'path';
import * as fs from 'fs';
import { promisify } from 'util';

const unlinkAsync = promisify(fs.unlink);

/**
 * Genera un nombre de archivo único basado en timestamp y random
 */
export function generateUniqueFilename(originalName: string): string {
    const timestamp = Date.now();
    const randomString = Array(16)
        .fill(null)
        .map(() => Math.round(Math.random() * 16).toString(16))
        .join('');
    const extension = getFileExtension(originalName);
    return `${timestamp}-${randomString}${extension}`;
}

/**
 * Extrae la extensión de un archivo incluyendo el punto
 */
export function getFileExtension(filename: string): string {
    return extname(filename);
}

/**
 * Formatea el tamaño de un archivo en bytes a formato legible
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Elimina un archivo físico del sistema de archivos
 */
export async function deletePhysicalFile(filePath: string): Promise<void> {
    try {
        await unlinkAsync(filePath);
    } catch (error) {
        console.error(`Error deleting file ${filePath}:`, error);
        throw error;
    }
}

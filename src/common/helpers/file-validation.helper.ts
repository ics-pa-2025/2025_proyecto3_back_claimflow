/**
 * Valida que el tamaño del archivo no exceda el límite
 */
export function validateFileSize(sizeBytes: number, maxSizeMB: number = 10): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return sizeBytes <= maxSizeBytes;
}

/**
 * Valida que el tipo MIME del archivo esté permitido
 */
export function validateFileType(mimeType: string, allowedTypes: string[]): boolean {
    return allowedTypes.includes(mimeType);
}

/**
 * Verifica si el archivo es una imagen
 */
export function isImageFile(mimeType: string): boolean {
    const imageTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml'
    ];
    return imageTypes.includes(mimeType);
}

/**
 * Verifica si el archivo es un PDF
 */
export function isPdfFile(mimeType: string): boolean {
    return mimeType === 'application/pdf';
}

/**
 * Obtiene los tipos MIME permitidos por defecto para archivos de reclamos
 */
export function getAllowedMimeTypes(): string[] {
    return [
        // Imágenes
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        // PDFs
        'application/pdf',
        // Documentos Office
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        // Texto
        'text/plain',
    ];
}

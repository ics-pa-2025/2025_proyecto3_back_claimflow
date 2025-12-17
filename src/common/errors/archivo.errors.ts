import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Clase base para errores relacionados con archivos
 */
export class ArchivoError extends HttpException {
    constructor(message: string, status: HttpStatus, public code: string) {
        super({ message, code }, status);
    }
}

/**
 * Error cuando no se encuentra un archivo
 */
export class ArchivoNotFoundError extends ArchivoError {
    constructor(archivoId: string) {
        super(
            `Archivo con ID ${archivoId} no encontrado`,
            HttpStatus.NOT_FOUND,
            'ARCHIVO_NOT_FOUND'
        );
    }
}

/**
 * Error cuando no se encuentra el reclamo asociado
 */
export class ReclamoNotFoundError extends ArchivoError {
    constructor(reclamoId: string) {
        super(
            `Reclamo con ID ${reclamoId} no encontrado`,
            HttpStatus.NOT_FOUND,
            'RECLAMO_NOT_FOUND'
        );
    }
}

/**
 * Error durante la carga de archivo
 */
export class FileUploadError extends ArchivoError {
    constructor(details: string) {
        super(
            `Error al cargar archivo: ${details}`,
            HttpStatus.INTERNAL_SERVER_ERROR,
            'FILE_UPLOAD_ERROR'
        );
    }
}

/**
 * Error durante la eliminación de archivo
 */
export class FileDeleteError extends ArchivoError {
    constructor(details: string) {
        super(
            `Error al eliminar archivo: ${details}`,
            HttpStatus.INTERNAL_SERVER_ERROR,
            'FILE_DELETE_ERROR'
        );
    }
}

/**
 * Error cuando el tipo de archivo no está permitido
 */
export class InvalidFileTypeError extends ArchivoError {
    constructor(mimeType: string) {
        super(
            `Tipo de archivo no permitido: ${mimeType}`,
            HttpStatus.BAD_REQUEST,
            'INVALID_FILE_TYPE'
        );
    }
}

/**
 * Error cuando el archivo excede el tamaño máximo
 */
export class FileSizeExceededError extends ArchivoError {
    constructor(sizeBytes: number, maxSizeMB: number) {
        const sizeMB = (sizeBytes / (1024 * 1024)).toFixed(2);
        super(
            `El archivo excede el tamaño máximo permitido. Tamaño: ${sizeMB}MB, Máximo: ${maxSizeMB}MB`,
            HttpStatus.BAD_REQUEST,
            'FILE_SIZE_EXCEEDED'
        );
    }
}

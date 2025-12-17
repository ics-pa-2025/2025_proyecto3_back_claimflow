import { Injectable } from '@nestjs/common';
import { ArchivoRepository } from './archivo.repository';
import { ReclamoService } from '../reclamo/reclamo.service';
import { ArchivoResponseDto } from './dto/archivo-response.dto';
import { CreateArchivoDto } from './dto/create-archivo.dto';
import {
    generateUniqueFilename,
    formatFileSize,
    deletePhysicalFile,
} from '../common/helpers/file-storage.helper';
import {
    validateFileSize,
    validateFileType,
    getAllowedMimeTypes,
} from '../common/helpers/file-validation.helper';
import {
    ArchivoNotFoundError,
    ReclamoNotFoundError,
    FileUploadError,
    FileDeleteError,
    InvalidFileTypeError,
    FileSizeExceededError,
} from '../common/errors/archivo.errors';
import { join } from 'path';
import * as fs from 'fs';
import { promisify } from 'util';

const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);

@Injectable()
export class ArchivoService {
    private readonly uploadsDir = './uploads';
    private readonly maxFileSizeMB = 10;

    constructor(
        private readonly archivoRepository: ArchivoRepository,
        private readonly reclamoService: ReclamoService,
    ) {
        this.ensureUploadsDirExists();
    }

    private async ensureUploadsDirExists(): Promise<void> {
        try {
            await mkdirAsync(this.uploadsDir, { recursive: true });
        } catch (error) {
            console.error('Error creating uploads directory:', error);
        }
    }

    async uploadFile(
        file: Express.Multer.File,
        reclamoId: string,
    ): Promise<ArchivoResponseDto> {
        // Validar que el reclamo existe
        const reclamo = await this.reclamoService.findOne(reclamoId);
        if (!reclamo) {
            throw new ReclamoNotFoundError(reclamoId);
        }

        // Validar tamaño del archivo
        if (!validateFileSize(file.size, this.maxFileSizeMB)) {
            throw new FileSizeExceededError(file.size, this.maxFileSizeMB);
        }

        // Validar tipo de archivo
        const allowedTypes = getAllowedMimeTypes();
        if (!validateFileType(file.mimetype, allowedTypes)) {
            throw new InvalidFileTypeError(file.mimetype);
        }

        try {
            // Generar nombre único
            const nombreAlmacenado = generateUniqueFilename(file.originalname);
            const rutaArchivo = join(this.uploadsDir, nombreAlmacenado);

            // Guardar archivo físicamente
            await writeFileAsync(rutaArchivo, file.buffer);

            // Crear registro en base de datos
            const createDto: CreateArchivoDto = {
                nombreOriginal: file.originalname,
                nombreAlmacenado,
                rutaArchivo,
                mimeType: file.mimetype,
                tamanoBytes: file.size,
                reclamoId,
            };

            const archivo = await this.archivoRepository.create(createDto);

            return this.mapToResponseDto(archivo);
        } catch (error) {
            throw new FileUploadError(error.message);
        }
    }

    async getArchivosByReclamo(reclamoId: string): Promise<ArchivoResponseDto[]> {
        const archivos = await this.archivoRepository.findByReclamoId(reclamoId);
        return archivos.map(archivo => this.mapToResponseDto(archivo));
    }

    async getArchivoById(id: string): Promise<ArchivoResponseDto> {
        const archivo = await this.archivoRepository.findById(id);
        if (!archivo) {
            throw new ArchivoNotFoundError(id);
        }
        return this.mapToResponseDto(archivo);
    }

    async deleteArchivo(id: string): Promise<void> {
        const archivo = await this.archivoRepository.findById(id);
        if (!archivo) {
            throw new ArchivoNotFoundError(id);
        }

        try {
            // Eliminar archivo físico
            await deletePhysicalFile(archivo.rutaArchivo);

            // Eliminar registro de base de datos
            await this.archivoRepository.deleteById(id);
        } catch (error) {
            throw new FileDeleteError(error.message);
        }
    }

    async getArchivoFilePath(id: string): Promise<string> {
        const archivo = await this.archivoRepository.findById(id);
        if (!archivo) {
            throw new ArchivoNotFoundError(id);
        }
        return archivo.rutaArchivo;
    }

    private mapToResponseDto(archivo: any): ArchivoResponseDto {
        return {
            id: archivo._id.toString(),
            nombreOriginal: archivo.nombreOriginal,
            nombreAlmacenado: archivo.nombreAlmacenado,
            rutaArchivo: archivo.rutaArchivo,
            mimeType: archivo.mimeType,
            tamanoBytes: archivo.tamanoBytes,
            tamanoLegible: formatFileSize(archivo.tamanoBytes),
            reclamoId: archivo.reclamoId.toString(),
            urlDescarga: `/archivo/download/${archivo._id.toString()}`,
            fechaCreacion: archivo.createdAt,
            fechaActualizacion: archivo.updatedAt,
        };
    }
}

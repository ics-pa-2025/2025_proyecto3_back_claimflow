import { ApiTags } from '@nestjs/swagger';
import {
    Controller,
    Post,
    Get,
    Delete,
    Param,
    UseInterceptors,
    UploadedFile,
    Res,
    HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ArchivoService } from './archivo.service';
import * as fs from 'fs';

@ApiTags('archivo')
@Controller('archivo')
export class ArchivoController {
    constructor(private readonly archivoService: ArchivoService) { }

    @Post('upload/:reclamoId')
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(
        @Param('reclamoId') reclamoId: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        if (!file) {
            return {
                statusCode: HttpStatus.BAD_REQUEST,
                message: 'No se proporcionó ningún archivo',
            };
        }

        return this.archivoService.uploadFile(file, reclamoId);
    }

    @Get('reclamo/:reclamoId')
    async getArchivosByReclamo(@Param('reclamoId') reclamoId: string) {
        return this.archivoService.getArchivosByReclamo(reclamoId);
    }

    @Get(':id')
    async getArchivo(@Param('id') id: string) {
        return this.archivoService.getArchivoById(id);
    }

    @Get('download/:id')
    async downloadArchivo(@Param('id') id: string, @Res() res: Response) {
        const archivo = await this.archivoService.getArchivoById(id);
        const filePath = await this.archivoService.getArchivoFilePath(id);

        // Verificar que el archivo existe físicamente
        if (!fs.existsSync(filePath)) {
            return res.status(HttpStatus.NOT_FOUND).json({
                statusCode: HttpStatus.NOT_FOUND,
                message: 'Archivo físico no encontrado',
            });
        }

        // Configurar headers para descarga
        res.setHeader('Content-Type', archivo.mimeType);
        res.setHeader(
            'Content-Disposition',
            `attachment; filename="${archivo.nombreOriginal}"`,
        );

        // Enviar archivo
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    }

    @Delete(':id')
    async deleteArchivo(@Param('id') id: string) {
        await this.archivoService.deleteArchivo(id);
        return {
            statusCode: HttpStatus.OK,
            message: 'Archivo eliminado correctamente',
        };
    }
}

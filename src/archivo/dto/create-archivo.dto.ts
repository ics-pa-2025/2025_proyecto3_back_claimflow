import { IsString, IsNotEmpty, IsMongoId, IsNumber, Min } from 'class-validator';

export class CreateArchivoDto {
    @IsString()
    @IsNotEmpty()
    nombreOriginal: string;

    @IsString()
    @IsNotEmpty()
    nombreAlmacenado: string;

    @IsString()
    @IsNotEmpty()
    rutaArchivo: string;

    @IsString()
    @IsNotEmpty()
    mimeType: string;

    @IsNumber()
    @Min(1)
    tamanoBytes: number;

    @IsMongoId()
    @IsNotEmpty()
    reclamoId: string;
}

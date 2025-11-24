import { IsString, IsNotEmpty, IsOptional, IsMongoId } from 'class-validator';

export class CreateReclamoDto {
    @IsString()
    @IsNotEmpty()
    tipo: string;

    @IsString()
    @IsNotEmpty()
    prioridad: string;

    @IsString()
    @IsNotEmpty()
    criticidad: string;

    @IsString()
    @IsNotEmpty()
    descripcion: string;

    @IsString()
    @IsOptional()
    evidencia?: string;

    @IsString()
    @IsNotEmpty()
    area: string;

    @IsMongoId()
    @IsNotEmpty()
    cliente: string;

    @IsString()
    @IsNotEmpty()
    proyecto: string;
}

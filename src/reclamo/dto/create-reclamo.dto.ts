import { IsString, IsNotEmpty, IsOptional, IsMongoId, IsArray } from 'class-validator';

export class CreateReclamoDto {
    @IsMongoId()
    @IsNotEmpty()
    tipo: string;

    @IsString()
    @IsOptional()
    prioridad?: string;

    @IsString()
    @IsOptional()
    criticidad?: string;

    @IsString()
    @IsNotEmpty()
    descripcion: string;

    @IsString()
    @IsOptional()
    evidencia?: string;

    @IsMongoId()
    @IsOptional()
    area?: string;

    @IsMongoId()
    @IsNotEmpty()
    cliente: string;

    @IsString()
    @IsNotEmpty()
    proyecto: string;

    @IsMongoId()
    @IsOptional()
    estado?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    responsables?: string[];
}

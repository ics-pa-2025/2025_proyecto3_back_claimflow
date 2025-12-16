import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAreaDto {
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @IsString()
    @IsOptional()
    descripcion?: string;
}

import {
  IsString,
  IsEmail,
  IsOptional,
  IsArray,
  ValidateNested,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';

class CreateProyectoDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  tipo: string;
}

export class CreateClienteDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsString()
  @IsNotEmpty()
  apellido: string;

  @IsString()
  @IsNotEmpty()
  dni: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  telefono?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProyectoDto)
  @IsOptional()
  proyectos?: CreateProyectoDto[];
}

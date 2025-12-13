import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsMongoId,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProyectoDto {
  @ApiProperty({ description: 'The name of the project' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ description: 'The description of the project' })
  @IsString()
  @IsNotEmpty()
  descripcion: string;

  @ApiProperty({ description: 'The ID of the project type', required: false })
  @IsMongoId()
  @IsOptional()
  tipo?: string;

  @ApiProperty({ description: 'The ID of the client', required: false })
  @IsMongoId()
  @IsOptional()
  clienteId?: string;

  @ApiProperty({ description: 'The ID of the project state', required: false })
  @IsMongoId()
  @IsOptional()
  estado?: string;

  @ApiProperty({
    description: 'The start date of the project',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  fechaInicio?: Date;

  @ApiProperty({ description: 'The end date of the project', required: false })
  @IsDateString()
  @IsOptional()
  fechaFin?: Date;
}

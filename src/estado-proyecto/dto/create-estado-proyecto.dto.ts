import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEstadoProyectoDto {
  @ApiProperty({ description: 'The name of the project state' })
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @ApiProperty({ description: 'The description of the project state' })
  @IsString()
  @IsNotEmpty()
  descripcion: string;
}

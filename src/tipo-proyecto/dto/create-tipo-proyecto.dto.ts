import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTipoProyectoDto {
    @ApiProperty({ description: 'The name of the project type' })
    @IsString()
    @IsNotEmpty()
    nombre: string;

    @ApiProperty({ description: 'The description of the project type' })
    @IsString()
    @IsNotEmpty()
    descripcion: string;
}

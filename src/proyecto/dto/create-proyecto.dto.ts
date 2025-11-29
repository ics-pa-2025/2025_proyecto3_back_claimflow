import { IsString, IsNotEmpty, IsDateString, IsMongoId } from 'class-validator';
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

    @ApiProperty({ description: 'The ID of the project type' })
    @IsMongoId()
    @IsNotEmpty()
    tipo: string;

    @ApiProperty({ description: 'The ID of the client' })
    @IsMongoId()
    @IsNotEmpty()
    clienteId: string;

    @ApiProperty({ description: 'The ID of the project state' })
    @IsMongoId()
    @IsNotEmpty()
    estado: string;

    @ApiProperty({ description: 'The start date of the project' })
    @IsDateString()
    @IsNotEmpty()
    fechaInicio: Date;

    @ApiProperty({ description: 'The end date of the project' })
    @IsDateString()
    @IsNotEmpty()
    fechaFin: Date;
}

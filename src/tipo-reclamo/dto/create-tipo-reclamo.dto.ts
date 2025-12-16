import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTipoReclamoDto {
    @ApiProperty({ example: 'Technical', description: 'The name of the claim type' })
    @IsNotEmpty()
    @IsString()
    nombre: string;

    @ApiProperty({ example: 'Technical issues with the platform', description: 'Description of the claim type', required: false })
    @IsOptional()
    @IsString()
    descripcion?: string;

    @ApiProperty({ example: true, description: 'Whether the type is active', default: true, required: false })
    @IsOptional()
    @IsBoolean()
    activo?: boolean;
}

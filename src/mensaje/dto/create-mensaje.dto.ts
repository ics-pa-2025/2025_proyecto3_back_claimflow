import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';

export class CreateMensajeDto {
    @IsString()
    @IsNotEmpty()
    contenido: string;

    @IsMongoId()
    @IsNotEmpty()
    reclamoId: string;
}

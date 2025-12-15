import { IsString, IsNotEmpty, IsArray, IsOptional } from 'class-validator';
import { Types } from 'mongoose';

export class CreateSolicitudReclamoDto {
	@IsString()
	@IsNotEmpty()
	tipo: string;

	@IsString()
	@IsNotEmpty()
	descripcion: string;

	@IsArray()
	@IsOptional()
	evidencia?: string[];

	@IsString()
	@IsNotEmpty()
	area: Types.ObjectId | string;

	@IsString()
	@IsNotEmpty()
	cliente: Types.ObjectId | string;

	@IsString()
	@IsNotEmpty()
	proyecto: Types.ObjectId | string;
}

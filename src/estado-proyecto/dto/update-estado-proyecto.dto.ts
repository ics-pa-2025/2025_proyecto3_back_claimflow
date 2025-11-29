import { PartialType } from '@nestjs/swagger';
import { CreateEstadoProyectoDto } from './create-estado-proyecto.dto';

export class UpdateEstadoProyectoDto extends PartialType(CreateEstadoProyectoDto) { }

import { PartialType } from '@nestjs/swagger';
import { CreateTipoProyectoDto } from './create-tipo-proyecto.dto';

export class UpdateTipoProyectoDto extends PartialType(CreateTipoProyectoDto) {}

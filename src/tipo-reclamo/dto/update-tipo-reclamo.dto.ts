import { PartialType } from '@nestjs/swagger';
import { CreateTipoReclamoDto } from './create-tipo-reclamo.dto';

export class UpdateTipoReclamoDto extends PartialType(CreateTipoReclamoDto) { }

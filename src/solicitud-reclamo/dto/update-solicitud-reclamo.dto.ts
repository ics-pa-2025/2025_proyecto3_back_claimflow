import { PartialType } from '@nestjs/swagger';
import { CreateSolicitudReclamoDto } from './create-solicitud-reclamo.dto';

export class UpdateSolicitudReclamoDto extends PartialType(CreateSolicitudReclamoDto) {}


import { Injectable } from '@nestjs/common';
import { CreateSolicitudReclamoDto } from './dto/create-solicitud-reclamo.dto';
import { UpdateSolicitudReclamoDto } from './dto/update-solicitud-reclamo.dto';
import { SolicitudReclamoRepository } from './solicitud-reclamo.repository';

@Injectable()
export class SolicitudReclamoService {
  constructor(private readonly solicitudReclamoRepository: SolicitudReclamoRepository) {}

  create(createSolicitudReclamoDto: CreateSolicitudReclamoDto) {
    return this.solicitudReclamoRepository.create(createSolicitudReclamoDto);
  }

  findAll() {
    return this.solicitudReclamoRepository.findAll();
  }

  findOne(id: string) {
    return this.solicitudReclamoRepository.findOne(id);
  }

  update(id: string, updateSolicitudReclamoDto: UpdateSolicitudReclamoDto) {
    return this.solicitudReclamoRepository.update(id, updateSolicitudReclamoDto);
  }

  remove(id: string) {
    return this.solicitudReclamoRepository.remove(id);
  }
}

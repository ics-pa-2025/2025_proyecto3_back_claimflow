
import { Injectable } from '@nestjs/common';
import { CreateSolicitudReclamoDto } from './dto/create-solicitud-reclamo.dto';
import { UpdateSolicitudReclamoDto } from './dto/update-solicitud-reclamo.dto';
import { SolicitudReclamoRepository } from './solicitud-reclamo.repository';
import { ReclamoService } from '../reclamo/reclamo.service';
import { EstadoReclamoService } from '../estado-reclamo/estado-reclamo.service';
import { CreateReclamoDto } from '../reclamo/dto/create-reclamo.dto';

@Injectable()
export class SolicitudReclamoService {
  constructor(
    private readonly solicitudReclamoRepository: SolicitudReclamoRepository,
    private readonly reclamoService: ReclamoService,
    private readonly estadoReclamoService: EstadoReclamoService,
  ) {}

  async create(createSolicitudReclamoDto: CreateSolicitudReclamoDto) {
    // Primero crear la solicitud (sin campos prohibidos ya saneados en el repo)
    const solicitud = await this.solicitudReclamoRepository.create(createSolicitudReclamoDto as any);

    // Crear un reclamo asociado a partir de la solicitud, pero SIN area
    const reclamoDto: CreateReclamoDto = {
      tipo: createSolicitudReclamoDto.tipo,
      descripcion: createSolicitudReclamoDto.descripcion,
      cliente: createSolicitudReclamoDto.cliente as any,
      proyecto: createSolicitudReclamoDto.proyecto as any,
      // Dejar prioridad/criticidad opcionales (se establecerán por defecto en el schema/servicio)
    } as any;

    try {
      // Intentar obtener el estado 'Recibido' y asignarlo al reclamo
      const estadoRecibido = await this.estadoReclamoService.findByNombre('Recibido');
      if (estadoRecibido) {
        (reclamoDto as any).estado = (estadoRecibido as any)._id.toString();
      }
      await this.reclamoService.create(reclamoDto);
    } catch (err) {
      // No detener la creación de la solicitud si falla la creación del reclamo,
      // pero permitir que los logs de Nest informen el problema.
    }

    return solicitud;
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

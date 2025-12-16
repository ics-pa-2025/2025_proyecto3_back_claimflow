
import { Injectable } from '@nestjs/common';
import { CreateSolicitudReclamoDto } from './dto/create-solicitud-reclamo.dto';
import { UpdateSolicitudReclamoDto } from './dto/update-solicitud-reclamo.dto';
import { SolicitudReclamoRepository } from './solicitud-reclamo.repository';
import { ReclamoService } from '../reclamo/reclamo.service';
import { CreateReclamoDto } from '../reclamo/dto/create-reclamo.dto';

@Injectable()
export class SolicitudReclamoService {
  constructor(
    private readonly solicitudReclamoRepository: SolicitudReclamoRepository,
    private readonly reclamoService: ReclamoService,
  ) {}

  async create(createSolicitudReclamoDto: CreateSolicitudReclamoDto) {
    // 1) Guardar la solicitud
  const solicitud = await this.solicitudReclamoRepository.create(createSolicitudReclamoDto);

    try {
      // 2) Crear automáticamente un reclamo asociado en estado 'Pendiente'
      const reclamoDto: CreateReclamoDto = {
        tipo: createSolicitudReclamoDto.tipo,
        // Do not assign any prioridad by default when creating from a solicitud
        criticidad: (createSolicitudReclamoDto as any).criticidad || 'Normal',
        descripcion: createSolicitudReclamoDto.descripcion,
        evidencia: Array.isArray(createSolicitudReclamoDto.evidencia) && createSolicitudReclamoDto.evidencia.length
          ? createSolicitudReclamoDto.evidencia[0]
          : (createSolicitudReclamoDto.evidencia as any as string) || undefined,
        area: createSolicitudReclamoDto.area as any,
        cliente: createSolicitudReclamoDto.cliente as any,
        proyecto: createSolicitudReclamoDto.proyecto as any,
      };

      // link the created solicitud id to the reclamo
      (reclamoDto as any).solicitud = (solicitud as any)._id;

      const reclamo = await this.reclamoService.create(reclamoDto);
      // Return both objects so controller can respond with reclamo id to frontend
      return { solicitud, reclamo };
    } catch (err) {
      // No queremos que la creación del reclamo impida que la solicitud se haya guardado.
      console.error('Error creando reclamo automáticamente desde solicitud:', err);
    }

    // If reclamo creation failed, still return the solicitud alone
    return { solicitud, reclamo: null };
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

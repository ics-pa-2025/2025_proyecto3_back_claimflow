
import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { CreateSolicitudReclamoDto } from './dto/create-solicitud-reclamo.dto';
import { UpdateSolicitudReclamoDto } from './dto/update-solicitud-reclamo.dto';
import { SolicitudReclamoRepository } from './solicitud-reclamo.repository';
import { ReclamoService } from '../reclamo/reclamo.service';
import { EstadoReclamoService } from '../estado-reclamo/estado-reclamo.service';
import { CreateReclamoDto } from '../reclamo/dto/create-reclamo.dto';
import { ArchivoService } from '../archivo/archivo.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SolicitudReclamoService {
  constructor(
    private readonly solicitudReclamoRepository: SolicitudReclamoRepository,
    @Inject(forwardRef(() => ReclamoService))
    private readonly reclamoService: ReclamoService,
    private readonly estadoReclamoService: EstadoReclamoService,
    @Inject(forwardRef(() => ArchivoService))
    private readonly archivoService: ArchivoService,
  ) { }

  async create(createSolicitudReclamoDto: CreateSolicitudReclamoDto, files?: Array<Express.Multer.File>) {
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
      const reclamo = await this.reclamoService.create(reclamoDto);

      // Si hay archivos, subirlos al reclamo usando ArchivoService
      if (files && files.length > 0 && reclamo && (reclamo as any)._id) {
        const reclamoId = (reclamo as any)._id.toString();

        // Subir cada archivo al reclamo
        for (const file of files) {
          try {
            // Leer el archivo temporal guardado en ./public
            const tempFilePath = path.join('./public', file.filename);
            const buffer = fs.readFileSync(tempFilePath);

            // Crear un objeto File simulado para ArchivoService
            const multerFile: Express.Multer.File = {
              ...file,
              buffer,
              path: tempFilePath
            };

            // Subir usando ArchivoService
            await this.archivoService.uploadFile(multerFile, reclamoId);

            // Eliminar archivo temporal
            try {
              fs.unlinkSync(tempFilePath);
            } catch (unlinkErr) {
              console.error('Error al eliminar archivo temporal:', unlinkErr);
            }
          } catch (fileErr) {
            console.error('Error al procesar archivo:', fileErr);
          }
        }
      }
    } catch (err) {
      // No detener la creación de la solicitud si falla la creación del reclamo,
      // pero permitir que los logs de Nest informen el problema.
      console.error('Error al crear reclamo desde solicitud:', err);
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

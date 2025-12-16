import { Injectable } from '@nestjs/common';
import { EstadoReclamoRepository } from './estado-reclamo.repository';
import { CreateEstadoReclamoDto } from './dto/create-estado-reclamo.dto';
import { UpdateEstadoReclamoDto } from './dto/update-estado-reclamo.dto';
import { EstadoReclamo } from './schemas/estado-reclamo.schema';

@Injectable()
export class EstadoReclamoService {
    constructor(private readonly estadoReclamoRepository: EstadoReclamoRepository) { }

    create(createEstadoReclamoDto: CreateEstadoReclamoDto): Promise<EstadoReclamo> {
        return this.estadoReclamoRepository.create(createEstadoReclamoDto);
    }

    findAll(): Promise<EstadoReclamo[]> {
        return this.estadoReclamoRepository.findAll();
    }

    findOne(id: string): Promise<EstadoReclamo> {
        return this.estadoReclamoRepository.findOne(id);
    }

    findByNombre(nombre: string): Promise<EstadoReclamo | null> {
        return this.estadoReclamoRepository.findByNombre(nombre);
    }

    update(id: string, updateEstadoReclamoDto: UpdateEstadoReclamoDto): Promise<EstadoReclamo> {
        return this.estadoReclamoRepository.update(id, updateEstadoReclamoDto);
    }

    remove(id: string): Promise<EstadoReclamo> {
        return this.estadoReclamoRepository.remove(id);
    }
}

import { Injectable } from '@nestjs/common';
import { ReclamoRepository } from './reclamo.repository';
import { CreateReclamoDto } from './dto/create-reclamo.dto';

import { EstadoReclamoService } from '../estado-reclamo/estado-reclamo.service';

@Injectable()
export class ReclamoService {
    constructor(
        private readonly reclamoRepository: ReclamoRepository,
        private readonly estadoReclamoService: EstadoReclamoService,
    ) { }

    async create(createReclamoDto: CreateReclamoDto) {
        if (!createReclamoDto.estado) {
            const estado = await this.estadoReclamoService.findByNombre('Pendiente');
            if (estado) {
                createReclamoDto.estado = (estado as any)._id.toString();
            }
        }
        return this.reclamoRepository.create(createReclamoDto);
    }

    findAll() {
        return this.reclamoRepository.findAll();
    }

    findOne(id: string) {
        return this.reclamoRepository.findOne(id);
    }

    update(id: string, updateReclamoDto: any) {
        return this.reclamoRepository.update(id, updateReclamoDto);
    }

    remove(id: string) {
        return this.reclamoRepository.remove(id);
    }
}

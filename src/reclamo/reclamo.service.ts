import { Injectable } from '@nestjs/common';
import { ReclamoRepository } from './reclamo.repository';
import { CreateReclamoDto } from './dto/create-reclamo.dto';

import { EstadoReclamoService } from '../estado-reclamo/estado-reclamo.service';
import { ClienteService } from '../cliente/cliente.service';

@Injectable()
export class ReclamoService {
    constructor(
        private readonly reclamoRepository: ReclamoRepository,
        private readonly estadoReclamoService: EstadoReclamoService,
        private readonly clienteService: ClienteService,
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

    async findAll(userId?: string, userRole?: string) {
        // If user is a client, filter by their cliente ID
        if (userRole === 'client' && userId) {
            const cliente = await this.clienteService.findByUsuarioId(userId);
            if (cliente) {
                return this.reclamoRepository.findAll((cliente as any)._id.toString());
            }
            return []; // No cliente found for this user
        }
        // For other roles, return all
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

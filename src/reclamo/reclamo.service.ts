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
            console.log(`[ReclamoService] Finding claims for client. UserID: ${userId}, ClientFound: ${!!cliente}`);

            if (cliente) {
                const results = await this.reclamoRepository.findAll((cliente as any)._id.toString());
                console.log(`[ReclamoService] Client ID: ${(cliente as any)._id}, Claims found: ${results.length}`);
                return results;
            }
            console.warn(`[ReclamoService] User has 'client' role but no Client record found.`);
            return []; // No cliente found for this user
        }
        // For other roles, return all
        return this.reclamoRepository.findAll();
    }

    findOne(id: string) {
        return this.reclamoRepository.findOne(id);
    }

    async update(id: string, updateReclamoDto: any) {
        // If there's a historial entry to add, append it to the existing historial
        if (updateReclamoDto.newHistorialEntry) {
            const newEntry = {
                fecha: new Date(),
                accion: updateReclamoDto.newHistorialEntry.accion,
                responsable: updateReclamoDto.newHistorialEntry.responsable,
            };
            console.log('[ReclamoService] Adding to historial:', newEntry);
            // Pass the new entry as an array with one element for $push
            updateReclamoDto.historial = [newEntry];
            delete updateReclamoDto.newHistorialEntry;
        }
        return this.reclamoRepository.update(id, updateReclamoDto);
    }

    remove(id: string) {
        return this.reclamoRepository.remove(id);
    }
}

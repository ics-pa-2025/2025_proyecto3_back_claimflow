import { Injectable } from '@nestjs/common';
import { ReclamoRepository } from './reclamo.repository';
import { CreateReclamoDto } from './dto/create-reclamo.dto';
import { ReclamoStatsDto } from './dto/reclamo-stats.dto';
import { ReclamoChartDto } from './dto/reclamo-chart.dto';
import { ReclamoPieChartDto } from './dto/reclamo-pie-chart.dto';

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

    async getDashboardStats(userId?: string, userRole?: string): Promise<ReclamoStatsDto> {
        let clienteId: string | undefined;

        if (userRole === 'client' && userId) {
            const cliente = await this.clienteService.findByUsuarioId(userId);
            if (cliente) {
                clienteId = (cliente as any)._id.toString();
            }
        }

        const estadoCerrado = await this.estadoReclamoService.findByNombre('Cerrado');
        const cerradoId = estadoCerrado ? (estadoCerrado as any)._id.toString() : undefined;

        const stats = await this.reclamoRepository.getStats(clienteId, cerradoId);

        let growthPercentage = 0;
        if (stats.lastMonth > 0) {
            growthPercentage = ((stats.thisMonth - stats.lastMonth) / stats.lastMonth) * 100;
        } else if (stats.thisMonth > 0) {
            growthPercentage = 100;
        }

        const formattedPercentage = growthPercentage.toFixed(1);
        const sign = growthPercentage >= 0 ? '+' : '';

        return {
            totalReclamos: stats.total,
            porcentajeCrecimiento: `${sign}${formattedPercentage}%`,
            diferenciaMesAnterior: `${sign}${formattedPercentage}% mes anterior`,
            reclamosEnProceso: stats.inProcess,
            reclamosFinalizados: stats.closed,
        };
    }

    async getReclamosPorDia(userId?: string, userRole?: string): Promise<ReclamoChartDto> {
        let clienteId: string | undefined;

        if (userRole === 'client' && userId) {
            const cliente = await this.clienteService.findByUsuarioId(userId);
            if (cliente) {
                clienteId = (cliente as any)._id.toString();
            }
        }

        const rawData = await this.reclamoRepository.getReclamosPorDia(clienteId);

        // Mongo $dayOfWeek: 1 (Sun) to 7 (Sat)
        // Wanted: Lun, Mar, Mie, Jue, Vie, Sab, Dom
        // Mapping: 2->Lun, 3->Mar, 4->Mie, 5->Jue, 6->Vie, 7->Sab, 1->Dom
        const dayMapping: Record<number, string> = {
            2: 'Lun', 3: 'Mar', 4: 'Mie', 5: 'Jue', 6: 'Vie', 7: 'Sab', 1: 'Dom'
        };

        const result = [
            { name: 'Lun', reclamos: 0 },
            { name: 'Mar', reclamos: 0 },
            { name: 'Mie', reclamos: 0 },
            { name: 'Jue', reclamos: 0 },
            { name: 'Vie', reclamos: 0 },
            { name: 'Sab', reclamos: 0 },
            { name: 'Dom', reclamos: 0 },
        ];

        rawData.forEach(item => {
            const dayName = dayMapping[item.dayOfWeek];
            if (dayName) {
                const index = result.findIndex(r => r.name === dayName);
                if (index !== -1) {
                    result[index].reclamos = item.count;
                }
            }
        });

        return result;
    }

    async getReclamosPorArea(userId?: string, userRole?: string): Promise<ReclamoPieChartDto> {
        let clienteId: string | undefined;

        if (userRole === 'client' && userId) {
            const cliente = await this.clienteService.findByUsuarioId(userId);
            if (cliente) {
                clienteId = (cliente as any)._id.toString();
            }
        }

        return this.reclamoRepository.getReclamosPorArea(clienteId);
    }
}

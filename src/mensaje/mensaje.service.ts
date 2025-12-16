import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { MensajeRepository } from './mensaje.repository';
import { CreateMensajeDto } from './dto/create-mensaje.dto';
import { Mensaje, EmisorInfo } from './schemas/mensaje.schema';
import { ReclamoService } from '../reclamo/reclamo.service';
import { ClienteService } from '../cliente/cliente.service';

import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class MensajeService {
    constructor(
        private readonly mensajeRepository: MensajeRepository,
        private readonly reclamoService: ReclamoService,
        private readonly clienteService: ClienteService,
        private readonly httpService: HttpService,
    ) { }

    async create(createMensajeDto: CreateMensajeDto, userId: string, userRole: string, userName?: string): Promise<Mensaje> {
        // Validate reclamo exists
        const reclamo = await this.reclamoService.findOne(createMensajeDto.reclamoId);
        if (!reclamo) {
            throw new NotFoundException('Reclamo not found');
        }

        // Validate user has access to this reclamo
        await this.validateAccess(createMensajeDto.reclamoId, userId, userRole);

        let emisorNombre = userName || 'Usuario';

        if (!userName) {
            try {
                if (userRole === 'client') {
                    const cliente = await this.clienteService.findByUsuarioId(userId);
                    if (cliente) {
                        emisorNombre = `${cliente.nombre} ${cliente.apellido}`;
                    }
                } else {
                    // Fetch user details from Auth Service
                    const url = `http://auth-service-claimflow:3001/user/${userId}`;
                    const response = await lastValueFrom(this.httpService.get(url));
                    const userData = response.data;
                    if (userData) {
                        // Try to construct a full name, fallback to username
                        const fullName = [userData.name, userData.lastname].filter(Boolean).join(' ');
                        emisorNombre = fullName || userData.username || 'Usuario';
                    }
                }
            } catch (error) {
                console.error('Error fetching sender name:', error.message);
                // Fallback to default 'Usuario' if fetching fails
            }
        }

        // Build emisor info
        const emisor: EmisorInfo = {
            tipo: userRole === 'client' ? 'cliente' : 'usuario',
            id: userId,
            nombre: emisorNombre
        };

        return this.mensajeRepository.create(createMensajeDto, emisor);
    }

    async findByReclamo(reclamoId: string, userId: string, userRole: string): Promise<Mensaje[]> {
        // Validate user has access to this reclamo
        await this.validateAccess(reclamoId, userId, userRole);

        return this.mensajeRepository.findByReclamo(reclamoId);
    }

    async markAsRead(mensajeId: string): Promise<Mensaje> {
        const mensaje = await this.mensajeRepository.markAsRead(mensajeId);
        if (!mensaje) {
            throw new NotFoundException('Mensaje not found');
        }
        return mensaje;
    }

    async getUnreadCount(reclamoId: string, tipo: 'cliente' | 'usuario'): Promise<number> {
        return this.mensajeRepository.findUnreadCountByReclamo(reclamoId, tipo);
    }

    private async validateAccess(reclamoId: string, userId: string, userRole: string): Promise<void> {
        if (userRole === 'client') {
            // Strict restriction: Clients cannot access notes/chat
            throw new ForbiddenException('Clientes no tienen acceso a notas internas.');
        }
        // For other roles (usuarios), they have access to all reclamos
    }
}

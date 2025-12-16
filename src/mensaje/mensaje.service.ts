import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { MensajeRepository } from './mensaje.repository';
import { CreateMensajeDto } from './dto/create-mensaje.dto';
import { Mensaje, EmisorInfo } from './schemas/mensaje.schema';
import { ReclamoService } from '../reclamo/reclamo.service';
import { ClienteService } from '../cliente/cliente.service';

@Injectable()
export class MensajeService {
    constructor(
        private readonly mensajeRepository: MensajeRepository,
        private readonly reclamoService: ReclamoService,
        private readonly clienteService: ClienteService,
    ) { }

    async create(createMensajeDto: CreateMensajeDto, userId: string, userRole: string): Promise<Mensaje> {
        // Validate reclamo exists
        const reclamo = await this.reclamoService.findOne(createMensajeDto.reclamoId);
        if (!reclamo) {
            throw new NotFoundException('Reclamo not found');
        }

        // Validate user has access to this reclamo
        await this.validateAccess(createMensajeDto.reclamoId, userId, userRole);

        // Build emisor info
        const emisor: EmisorInfo = {
            tipo: userRole === 'client' ? 'cliente' : 'usuario',
            id: userId,
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
            // For clients, check if the reclamo belongs to them
            const reclamo = await this.reclamoService.findOne(reclamoId);
            const cliente = await this.clienteService.findByUsuarioId(userId);

            if (!cliente || (reclamo as any).cliente._id.toString() !== (cliente as any)._id.toString()) {
                throw new ForbiddenException('You do not have access to this reclamo');
            }
        }
        // For other roles (usuarios), they have access to all reclamos
    }
}

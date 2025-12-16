import { Controller, Get, Patch, Param, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { MensajeService } from './mensaje.service';
import { HttpService } from '@nestjs/axios';
import { Request } from 'express';
import { lastValueFrom } from 'rxjs';

@ApiTags('mensaje')
@Controller('mensaje')
export class MensajeController {
    constructor(
        private readonly mensajeService: MensajeService,
        private readonly httpService: HttpService,
    ) { }

    @Get('reclamo/:reclamoId')
    @ApiOperation({ summary: 'Get all messages for a reclamo' })
    @ApiResponse({ status: 200, description: 'Return all messages.' })
    async findByReclamo(
        @Param('reclamoId') reclamoId: string,
        @Req() request: Request,
    ) {
        const authHeader = request.headers.authorization;
        if (!authHeader) {
            return [];
        }

        try {
            const token = authHeader.replace('Bearer ', '');
            const url = `http://auth-service-claimflow:3001/user/me`;
            const response = await lastValueFrom(
                this.httpService.get(url, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            );

            const user = response.data;
            const userRole = user.roles && user.roles.length > 0 ? user.roles[0].name : null;

            return this.mensajeService.findByReclamo(reclamoId, user.id, userRole);
        } catch (error) {
            return [];
        }
    }

    @Patch(':id/read')
    @ApiOperation({ summary: 'Mark message as read' })
    @ApiResponse({ status: 200, description: 'Message marked as read.' })
    markAsRead(@Param('id') id: string) {
        return this.mensajeService.markAsRead(id);
    }

    @Get('reclamo/:reclamoId/unread/:tipo')
    @ApiOperation({ summary: 'Get unread message count' })
    @ApiResponse({ status: 200, description: 'Return unread count.' })
    getUnreadCount(
        @Param('reclamoId') reclamoId: string,
        @Param('tipo') tipo: 'cliente' | 'usuario',
    ) {
        return this.mensajeService.getUnreadCount(reclamoId, tipo);
    }
}

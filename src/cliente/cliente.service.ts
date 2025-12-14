import { HttpService } from '@nestjs/axios';
import { Injectable, ConflictException, Inject, forwardRef, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ClienteRepository } from './cliente.repository';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { ProyectoService } from '../proyecto/proyecto.service';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class ClienteService {
    constructor(
        private readonly clienteRepository: ClienteRepository,
        @Inject(forwardRef(() => ProyectoService)) private readonly proyectoService: ProyectoService,
        private readonly httpService: HttpService
    ) { }

    async create(createClienteDto: CreateClienteDto) {
        if (createClienteDto.usuarioId) {
            await this.validateUserRole(createClienteDto.usuarioId);
        }
        try {
            return await this.clienteRepository.create(createClienteDto);
        } catch (error) {
            if (error.code === 11000) {
                if (error.keyPattern.dni) {
                    throw new ConflictException('Ya existe un cliente con ese DNI');
                }
                if (error.keyPattern.email) {
                    throw new ConflictException('Ya existe un cliente con ese Email');
                }
            }
            throw error;
        }
    }

    private async validateUserRole(usuarioId: string) {
        try {
            // "auth-service-claimflow" is the container name in shared-microservices network
            const url = `http://auth-service-claimflow:3001/user/${usuarioId}/roles`;
            const response = await lastValueFrom(this.httpService.get(url));
            const userWithRoles = response.data;

            // Should check for 'client' or 'cliente' depending on auth service seeder
            // The seeder uses 'client', so we check for that.
            const hasClientRole = userWithRoles.roles && userWithRoles.roles.some((r: any) => r.name === 'client');

            if (!hasClientRole) {
                throw new BadRequestException('El usuario indicado no tiene el rol de cliente.');
            }
        } catch (error: any) {
            if (error instanceof BadRequestException) {
                throw error;
            }
            console.error('Error validating user role:', error.message);
            throw new BadRequestException('Error al validar el usuario: ' + (error.response?.data?.message || error.message));
        }
    }

    findAll() {
        return this.clienteRepository.findAll();
    }

    findOne(id: string) {
        return this.clienteRepository.findOne(id);
    }

    update(id: string, updateClienteDto: any) {
        return this.clienteRepository.update(id, updateClienteDto);
    }

    async remove(id: string) {
        await this.proyectoService.removeClientFromProjects(id);
        return this.clienteRepository.remove(id);
    }
}

import { Injectable, ConflictException } from '@nestjs/common';
import { ClienteRepository } from './cliente.repository';
import { CreateClienteDto } from './dto/create-cliente.dto';

@Injectable()
export class ClienteService {
    constructor(private readonly clienteRepository: ClienteRepository) { }

    async create(createClienteDto: CreateClienteDto) {
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

    findAll() {
        return this.clienteRepository.findAll();
    }

    findOne(id: string) {
        return this.clienteRepository.findOne(id);
    }

    update(id: string, updateClienteDto: any) {
        return this.clienteRepository.update(id, updateClienteDto);
    }

    remove(id: string) {
        return this.clienteRepository.remove(id);
    }
}

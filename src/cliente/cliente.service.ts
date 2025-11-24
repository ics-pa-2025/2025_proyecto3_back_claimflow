import { Injectable } from '@nestjs/common';
import { ClienteRepository } from './cliente.repository';
import { CreateClienteDto } from './dto/create-cliente.dto';

@Injectable()
export class ClienteService {
    constructor(private readonly clienteRepository: ClienteRepository) { }

    create(createClienteDto: CreateClienteDto) {
        return this.clienteRepository.create(createClienteDto);
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

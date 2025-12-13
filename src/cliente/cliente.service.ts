import {
  Injectable,
  ConflictException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { ClienteRepository } from './cliente.repository';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { ProyectoService } from '../proyecto/proyecto.service';

@Injectable()
export class ClienteService {
  constructor(
    private readonly clienteRepository: ClienteRepository,
    @Inject(forwardRef(() => ProyectoService))
    private readonly proyectoService: ProyectoService,
  ) {}

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

  async remove(id: string) {
    await this.proyectoService.removeClientFromProjects(id);
    return this.clienteRepository.remove(id);
  }
}

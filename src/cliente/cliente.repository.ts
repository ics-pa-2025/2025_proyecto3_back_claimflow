import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cliente, ClienteDocument } from './schemas/cliente.schema';
import { CreateClienteDto } from './dto/create-cliente.dto';

@Injectable()
export class ClienteRepository {
  constructor(
    @InjectModel(Cliente.name) private clienteModel: Model<ClienteDocument>,
  ) {}

  async create(createClienteDto: CreateClienteDto): Promise<Cliente> {
    const createdCliente = new this.clienteModel(createClienteDto);
    return createdCliente.save();
  }

  async findAll(): Promise<Cliente[]> {
    return this.clienteModel.find({ fechaEliminacion: null }).exec();
  }

  async findOne(id: string): Promise<Cliente | null> {
    return this.clienteModel
      .findOne({ _id: id, fechaEliminacion: null })
      .exec();
  }

  async update(id: string, updateClienteDto: any): Promise<Cliente | null> {
    return this.clienteModel
      .findOneAndUpdate({ _id: id, fechaEliminacion: null }, updateClienteDto, {
        new: true,
      })
      .exec();
  }

  async remove(id: string): Promise<Cliente | null> {
    return this.clienteModel
      .findByIdAndUpdate(id, { fechaEliminacion: new Date() }, { new: true })
      .exec();
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EstadoReclamo, EstadoReclamoDocument } from './schemas/estado-reclamo.schema';
import { CreateEstadoReclamoDto } from './dto/create-estado-reclamo.dto';
import { UpdateEstadoReclamoDto } from './dto/update-estado-reclamo.dto';

@Injectable()
export class EstadoReclamoRepository {
    constructor(@InjectModel(EstadoReclamo.name) private estadoReclamoModel: Model<EstadoReclamoDocument>) { }

    async create(createEstadoReclamoDto: CreateEstadoReclamoDto): Promise<EstadoReclamo> {
        const createdEstado = new this.estadoReclamoModel(createEstadoReclamoDto);
        return createdEstado.save();
    }

    async findAll(): Promise<EstadoReclamo[]> {
        return this.estadoReclamoModel.find().exec();
    }

    async findOne(id: string): Promise<EstadoReclamo> {
        const estado = await this.estadoReclamoModel.findById(id).exec();
        if (!estado) {
            throw new NotFoundException(`EstadoReclamo with ID ${id} not found`);
        }
        return estado;
    }

    async findByNombre(nombre: string): Promise<EstadoReclamo | null> {
        return this.estadoReclamoModel.findOne({ nombre }).exec();
    }

    async update(id: string, updateEstadoReclamoDto: UpdateEstadoReclamoDto): Promise<EstadoReclamo> {
        const updatedEstado = await this.estadoReclamoModel.findByIdAndUpdate(id, updateEstadoReclamoDto, { new: true }).exec();
        if (!updatedEstado) {
            throw new NotFoundException(`EstadoReclamo with ID ${id} not found`);
        }
        return updatedEstado;
    }

    async remove(id: string): Promise<EstadoReclamo> {
        const deletedEstado = await this.estadoReclamoModel.findByIdAndDelete(id).exec();
        if (!deletedEstado) {
            throw new NotFoundException(`EstadoReclamo with ID ${id} not found`);
        }
        return deletedEstado;
    }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EstadoProyecto, EstadoProyectoDocument } from './schemas/estado-proyecto.schema';
import { CreateEstadoProyectoDto } from './dto/create-estado-proyecto.dto';
import { UpdateEstadoProyectoDto } from './dto/update-estado-proyecto.dto';

@Injectable()
export class EstadoProyectoService {
    constructor(
        @InjectModel(EstadoProyecto.name) private estadoProyectoModel: Model<EstadoProyectoDocument>,
    ) { }

    async create(createEstadoProyectoDto: CreateEstadoProyectoDto): Promise<EstadoProyecto> {
        const createdEstadoProyecto = new this.estadoProyectoModel(createEstadoProyectoDto);
        return createdEstadoProyecto.save();
    }

    async findAll(): Promise<EstadoProyecto[]> {
        return this.estadoProyectoModel.find({ deletedAt: null }).exec();
    }

    async findOne(id: string): Promise<EstadoProyecto> {
        const estadoProyecto = await this.estadoProyectoModel.findOne({ _id: id, deletedAt: null }).exec();
        if (!estadoProyecto) {
            throw new NotFoundException(`EstadoProyecto with ID ${id} not found`);
        }
        return estadoProyecto;
    }

    async update(id: string, updateEstadoProyectoDto: UpdateEstadoProyectoDto): Promise<EstadoProyecto> {
        const updatedEstadoProyecto = await this.estadoProyectoModel
            .findOneAndUpdate({ _id: id, deletedAt: null }, updateEstadoProyectoDto, { new: true })
            .exec();
        if (!updatedEstadoProyecto) {
            throw new NotFoundException(`EstadoProyecto with ID ${id} not found`);
        }
        return updatedEstadoProyecto;
    }

    async remove(id: string): Promise<EstadoProyecto> {
        const deletedEstadoProyecto = await this.estadoProyectoModel
            .findOneAndUpdate({ _id: id, deletedAt: null }, { deletedAt: new Date() }, { new: true })
            .exec();
        if (!deletedEstadoProyecto) {
            throw new NotFoundException(`EstadoProyecto with ID ${id} not found`);
        }
        return deletedEstadoProyecto;
    }
}

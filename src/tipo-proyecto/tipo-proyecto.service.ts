import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TipoProyecto, TipoProyectoDocument } from './schemas/tipo-proyecto.schema';
import { CreateTipoProyectoDto } from './dto/create-tipo-proyecto.dto';
import { UpdateTipoProyectoDto } from './dto/update-tipo-proyecto.dto';

@Injectable()
export class TipoProyectoService {
    constructor(
        @InjectModel(TipoProyecto.name) private tipoProyectoModel: Model<TipoProyectoDocument>,
    ) { }

    async create(createTipoProyectoDto: CreateTipoProyectoDto): Promise<TipoProyecto> {
        const createdTipoProyecto = new this.tipoProyectoModel(createTipoProyectoDto);
        return createdTipoProyecto.save();
    }

    async findAll(): Promise<TipoProyecto[]> {
        return this.tipoProyectoModel.find({ deletedAt: null }).exec();
    }

    async findOne(id: string): Promise<TipoProyecto> {
        const tipoProyecto = await this.tipoProyectoModel.findOne({ _id: id, deletedAt: null }).exec();
        if (!tipoProyecto) {
            throw new NotFoundException(`TipoProyecto with ID ${id} not found`);
        }
        return tipoProyecto;
    }

    async update(id: string, updateTipoProyectoDto: UpdateTipoProyectoDto): Promise<TipoProyecto> {
        const updatedTipoProyecto = await this.tipoProyectoModel
            .findOneAndUpdate({ _id: id, deletedAt: null }, updateTipoProyectoDto, { new: true })
            .exec();
        if (!updatedTipoProyecto) {
            throw new NotFoundException(`TipoProyecto with ID ${id} not found`);
        }
        return updatedTipoProyecto;
    }

    async remove(id: string): Promise<TipoProyecto> {
        const deletedTipoProyecto = await this.tipoProyectoModel
            .findOneAndUpdate({ _id: id, deletedAt: null }, { deletedAt: new Date() }, { new: true })
            .exec();
        if (!deletedTipoProyecto) {
            throw new NotFoundException(`TipoProyecto with ID ${id} not found`);
        }
        return deletedTipoProyecto;
    }
}

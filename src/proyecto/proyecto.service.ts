    
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Proyecto, ProyectoDocument } from './schemas/proyecto.schema';
import { Types as MongooseTypes } from 'mongoose';
import { CreateProyectoDto } from './dto/create-proyecto.dto';
import { UpdateProyectoDto } from './dto/update-proyecto.dto';

import { Reclamo, ReclamoDocument } from '../reclamo/schemas/reclamo.schema';

@Injectable()
export class ProyectoService {
    constructor(
        @InjectModel(Proyecto.name) private proyectoModel: Model<ProyectoDocument>,
        @InjectModel(Reclamo.name) private reclamoModel: Model<ReclamoDocument>,
    ) { }

    async create(createProyectoDto: CreateProyectoDto): Promise<Proyecto> {
        try {
            const createdProyecto = new this.proyectoModel(createProyectoDto);
            return await createdProyecto.save();
        } catch (error) {
            if (error.code === 11000) {
                throw new ConflictException('Ya existe un proyecto con ese nombre');
            }
            throw error;
        }
    }

    async findAll(): Promise<Proyecto[]> {
        return this.proyectoModel
            .find({ deletedAt: null })
            .populate('tipo')
            .populate('estado')
            .populate('clienteId')
            .exec();
    }

    async findOne(id: string): Promise<Proyecto> {
        const proyecto = await this.proyectoModel
            .findOne({ _id: id, deletedAt: null })
            .populate('tipo')
            .populate('estado')
            .populate('clienteId')
            .exec();
        if (!proyecto) {
            throw new NotFoundException(`Proyecto with ID ${id} not found`);
        }
        return proyecto;
    }

    async update(id: string, updateProyectoDto: UpdateProyectoDto): Promise<Proyecto> {
        try {
            const updatedProyecto = await this.proyectoModel
                .findOneAndUpdate({ _id: id, deletedAt: null }, updateProyectoDto, { new: true })
                .populate('tipo')
                .populate('estado')
                .populate('clienteId')
                .exec();
            if (!updatedProyecto) {
                throw new NotFoundException(`Proyecto with ID ${id} not found`);
            }
            return updatedProyecto;
        } catch (error) {
            if (error.code === 11000) {
                throw new ConflictException('Ya existe un proyecto con ese nombre');
            }
            throw error;
        }
    }

    async remove(id: string): Promise<Proyecto> {
        const deletedProyecto = await this.proyectoModel
            .findOneAndUpdate({ _id: id, deletedAt: null }, { deletedAt: new Date() }, { new: true })
            .exec();
        if (!deletedProyecto) {
            throw new NotFoundException(`Proyecto with ID ${id} not found`);
        }
        return deletedProyecto;
    }

    // Methods from Class Diagram
    async crearProyecto(createProyectoDto: CreateProyectoDto): Promise<Proyecto> {
        return this.create(createProyectoDto);
    }

    async actualizarProyecto(id: string, updateProyectoDto: UpdateProyectoDto): Promise<Proyecto> {
        return this.update(id, updateProyectoDto);
    }

    async obtenerReclamos(id: string): Promise<Reclamo[]> {
        // Verify project exists
        await this.findOne(id);
        return this.reclamoModel.find({ proyecto: id }).exec();
    }

    async cambiarEstado(id: string, estadoId: string): Promise<Proyecto> {
        return this.update(id, { estado: estadoId });
    }

    async removeClientFromProjects(clienteId: string): Promise<void> {
        await this.proyectoModel.updateMany({ clienteId: clienteId }, { $set: { clienteId: null } }).exec();
    }

    async findByCliente(clienteId: string): Promise<Proyecto[]> {
        // Convertir a ObjectId si es necesario
        const objectId = MongooseTypes.ObjectId.isValid(clienteId) ? new MongooseTypes.ObjectId(clienteId) : clienteId;
        return this.proyectoModel
            .find({ clienteId: objectId, deletedAt: null })
            .populate('tipo')
            .populate('estado')
            .populate({ path: 'clienteId', model: 'Cliente' })
            .exec();
    }
}

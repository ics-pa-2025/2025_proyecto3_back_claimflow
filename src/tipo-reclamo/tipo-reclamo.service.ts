import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TipoReclamo, TipoReclamoDocument } from './schemas/tipo-reclamo.schema';
import { CreateTipoReclamoDto } from './dto/create-tipo-reclamo.dto';
import { UpdateTipoReclamoDto } from './dto/update-tipo-reclamo.dto';

@Injectable()
export class TipoReclamoService {
    constructor(
        @InjectModel(TipoReclamo.name) private tipoReclamoModel: Model<TipoReclamoDocument>,
    ) { }

    async create(createTipoReclamoDto: CreateTipoReclamoDto): Promise<TipoReclamo> {
        const createdTipoReclamo = new this.tipoReclamoModel(createTipoReclamoDto);
        return createdTipoReclamo.save();
    }

    async findAll(): Promise<TipoReclamo[]> {
        // We filter by activo: true if we want to hide inactive ones by default, 
        // but traditionally findAll returns all for admin purposes. 
        // However, TipoProyecto filtered by deletedAt: null.
        // User rules said "active" usually. I will implement physical deletion for now 
        // OR standard findAll returns all, but let's stick to simple CRUD.
        // If "active" acts as soft delete, we might want to filter. 
        // For now, I'll return all and let the frontend filter or specific endpoints handle it.
        // Wait, TipoProyecto does `find({ deletedAt: null })`.
        // So I should arguably do `find({ activo: true })` if active==false means deleted.
        // But active=false might just mean disabled but visible in admin.
        // I will return ALL for now to allow admin to see/tweak them. 
        // Or should I follow TipoProyecto strictly? TipoProyecto uses soft delete.
        // I'll stick to returning all for now, as 'activo' is a status, not a deletion marker in the schema I defined (default true).
        return this.tipoReclamoModel.find().exec();
    }

    async findOne(id: string): Promise<TipoReclamo> {
        const tipoReclamo = await this.tipoReclamoModel.findById(id).exec();
        if (!tipoReclamo) {
            throw new NotFoundException(`TipoReclamo with ID ${id} not found`);
        }
        return tipoReclamo;
    }

    async update(id: string, updateTipoReclamoDto: UpdateTipoReclamoDto): Promise<TipoReclamo> {
        const updatedTipoReclamo = await this.tipoReclamoModel
            .findByIdAndUpdate(id, updateTipoReclamoDto, { new: true })
            .exec();
        if (!updatedTipoReclamo) {
            throw new NotFoundException(`TipoReclamo with ID ${id} not found`);
        }
        return updatedTipoReclamo;
    }

    async remove(id: string): Promise<TipoReclamo> {
        // Physical delete
        const deletedTipoReclamo = await this.tipoReclamoModel.findByIdAndDelete(id).exec();
        if (!deletedTipoReclamo) {
            throw new NotFoundException(`TipoReclamo with ID ${id} not found`);
        }
        return deletedTipoReclamo;
    }
}

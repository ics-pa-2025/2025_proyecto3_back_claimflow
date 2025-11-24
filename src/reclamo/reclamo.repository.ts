import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reclamo, ReclamoDocument } from './schemas/reclamo.schema';
import { CreateReclamoDto } from './dto/create-reclamo.dto';

@Injectable()
export class ReclamoRepository {
    constructor(@InjectModel(Reclamo.name) private reclamoModel: Model<ReclamoDocument>) { }

    async create(createReclamoDto: CreateReclamoDto): Promise<Reclamo> {
        const createdReclamo = new this.reclamoModel({
            ...createReclamoDto,
            historial: [{
                fecha: new Date(),
                accion: 'Reclamo creado',
                responsable: 'Sistema', // Or the user if we had auth context
            }],
        });
        return createdReclamo.save();
    }

    async findAll(): Promise<Reclamo[]> {
        return this.reclamoModel.find().populate('cliente').exec();
    }

    async findOne(id: string): Promise<Reclamo | null> {
        return this.reclamoModel.findById(id).populate('cliente').exec();
    }

    async update(id: string, updateReclamoDto: any): Promise<Reclamo | null> {
        // If status or area changes, we should probably add to history.
        // For simplicity, I'll just update the fields for now, but in a real app, logic would be in Service.
        return this.reclamoModel.findByIdAndUpdate(id, updateReclamoDto, { new: true }).exec();
    }

    async remove(id: string): Promise<Reclamo | null> {
        return this.reclamoModel.findByIdAndDelete(id).exec();
    }
}

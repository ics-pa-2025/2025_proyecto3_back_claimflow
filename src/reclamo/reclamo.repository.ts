import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Reclamo, ReclamoDocument } from './schemas/reclamo.schema';
import { CreateReclamoDto } from './dto/create-reclamo.dto';

@Injectable()
export class ReclamoRepository {
    constructor(@InjectModel(Reclamo.name) private reclamoModel: Model<ReclamoDocument>) { }

    async create(createReclamoDto: CreateReclamoDto): Promise<Reclamo> {
        // Ensure dto is treated as a plain object to avoid [Object: null prototype] issues with spread
        const plainDto = JSON.parse(JSON.stringify(createReclamoDto));

        const createdReclamo = new this.reclamoModel({
            ...plainDto,
            historial: [{
                fecha: new Date(),
                accion: 'Reclamo creado',
                responsable: 'Sistema',
            }],
        });
        return createdReclamo.save();
    }

    async findAll(clienteId?: string): Promise<Reclamo[]> {
        const filter = clienteId ? { cliente: clienteId } : {};
        return this.reclamoModel.find(filter)
            .populate('cliente')
            .populate('proyecto')
            .populate({ path: 'estado', select: 'nombre descripcion color' })
            .populate({ path: 'area', select: 'nombre descripcion' })
            .exec();
    }

    async findOne(id: string): Promise<Reclamo | null> {
        return this.reclamoModel.findById(id)
            .populate('cliente')
            .populate('proyecto')
            .populate({ path: 'estado', select: 'nombre descripcion color' })
            .populate({ path: 'area', select: 'nombre descripcion' })
            .exec();
    }

    async update(id: string, updateReclamoDto: any): Promise<Reclamo | null> {
        return this.reclamoModel.findByIdAndUpdate(id, updateReclamoDto, { new: true }).exec();
    }

    async remove(id: string): Promise<Reclamo | null> {
        return this.reclamoModel.findByIdAndDelete(id).exec();
    }
}

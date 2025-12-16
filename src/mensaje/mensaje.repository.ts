import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Mensaje, MensajeDocument } from './schemas/mensaje.schema';
import { CreateMensajeDto } from './dto/create-mensaje.dto';
import { EmisorInfo } from './schemas/mensaje.schema';

@Injectable()
export class MensajeRepository {
    constructor(
        @InjectModel(Mensaje.name) private mensajeModel: Model<MensajeDocument>,
    ) { }

    async create(createMensajeDto: CreateMensajeDto, emisor: EmisorInfo): Promise<Mensaje> {
        const mensaje = new this.mensajeModel({
            ...createMensajeDto,
            emisor,
            fechaCreacion: new Date(),
        });
        return mensaje.save();
    }

    async findByReclamo(reclamoId: string): Promise<Mensaje[]> {
        return this.mensajeModel
            .find({ reclamoId, fechaEliminacion: null })
            .sort({ fechaCreacion: 1 })
            .exec();
    }

    async markAsRead(mensajeId: string): Promise<Mensaje | null> {
        return this.mensajeModel
            .findByIdAndUpdate(
                mensajeId,
                { leido: true },
                { new: true }
            )
            .exec();
    }

    async findUnreadCountByReclamo(reclamoId: string, tipo: 'cliente' | 'usuario'): Promise<number> {
        return this.mensajeModel
            .countDocuments({
                reclamoId,
                'emisor.tipo': { $ne: tipo },
                leido: false,
                fechaEliminacion: null
            })
            .exec();
    }

    async findById(id: string): Promise<Mensaje | null> {
        return this.mensajeModel.findById(id).exec();
    }
}

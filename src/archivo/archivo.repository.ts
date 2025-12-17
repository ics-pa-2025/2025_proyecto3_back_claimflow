import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Archivo, ArchivoDocument } from './schemas/archivo.schema';
import { CreateArchivoDto } from './dto/create-archivo.dto';

@Injectable()
export class ArchivoRepository {
    constructor(
        @InjectModel(Archivo.name) private archivoModel: Model<ArchivoDocument>,
    ) { }

    async create(createArchivoDto: CreateArchivoDto): Promise<ArchivoDocument> {
        const archivo = new this.archivoModel(createArchivoDto);
        return archivo.save();
    }

    async findByReclamoId(reclamoId: string): Promise<ArchivoDocument[]> {
        return this.archivoModel
            .find({ reclamoId })
            .sort({ createdAt: -1 })
            .exec();
    }

    async findById(id: string): Promise<ArchivoDocument | null> {
        return this.archivoModel.findById(id).exec();
    }

    async deleteById(id: string): Promise<ArchivoDocument | null> {
        return this.archivoModel.findByIdAndDelete(id).exec();
    }

    async countByReclamoId(reclamoId: string): Promise<number> {
        return this.archivoModel.countDocuments({ reclamoId }).exec();
    }
}

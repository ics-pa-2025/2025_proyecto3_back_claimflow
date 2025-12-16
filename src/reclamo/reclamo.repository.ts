import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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
        let updateOperation: any = {};

        // If historial array is provided, use $push to add the new entry
        if (updateReclamoDto.historial && Array.isArray(updateReclamoDto.historial)) {
            // Get the last element (the new one to add)
            const newEntry = updateReclamoDto.historial[updateReclamoDto.historial.length - 1];
            updateOperation.$push = { historial: newEntry };
            delete updateReclamoDto.historial;
        }

        // Add other fields to update
        updateOperation = { ...updateOperation, ...updateReclamoDto };

        return this.reclamoModel.findByIdAndUpdate(id, updateOperation, { new: true })
            .populate('cliente')
            .populate('proyecto')
            .populate({ path: 'estado', select: 'nombre descripcion color' })
            .populate({ path: 'area', select: 'nombre descripcion' })
            .exec();
    }

    async remove(id: string): Promise<Reclamo | null> {
        return this.reclamoModel.findByIdAndDelete(id).exec();
    }

    async getStats(clienteId?: string, cerradoId?: string): Promise<{ total: number; thisMonth: number; lastMonth: number; closed: number; inProcess: number }> {
        const now = new Date();
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

        const pipeline: any[] = [
            {
                $addFields: {
                    clienteObjId: { $toObjectId: '$cliente' },
                    estadoObjId: { $toObjectId: '$estado' }
                }
            }
        ];

        if (clienteId) {
            pipeline.push({
                $match: { clienteObjId: new Types.ObjectId(clienteId) }
            });
        }

        const statsPipeline = [
            ...pipeline,
            {
                $facet: {
                    total: [{ $count: 'count' }],
                    thisMonth: [
                        { $match: { createdAt: { $gte: startOfThisMonth } } },
                        { $count: 'count' }
                    ],
                    lastMonth: [
                        { $match: { createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
                        { $count: 'count' }
                    ],
                    closed: [
                        { $match: cerradoId ? { estadoObjId: new Types.ObjectId(cerradoId) } : {} },
                        { $count: 'count' }
                    ],
                    inProcess: [
                        { $match: cerradoId ? { estadoObjId: { $ne: new Types.ObjectId(cerradoId) } } : {} },
                        { $count: 'count' }
                    ]
                }
            }
        ];

        const results = await this.reclamoModel.aggregate(statsPipeline).exec();
        const stats = results[0];

        return {
            total: stats.total[0]?.count || 0,
            thisMonth: stats.thisMonth[0]?.count || 0,
            lastMonth: stats.lastMonth[0]?.count || 0,
            closed: stats.closed[0]?.count || 0,
            inProcess: stats.inProcess[0]?.count || 0
        };
    }

    async getReclamosPorDia(clienteId?: string): Promise<{ dayOfWeek: number; count: number }[]> {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - 6); // Last 7 days including today
        startOfWeek.setHours(0, 0, 0, 0);

        const matchStage: any = {
            createdAt: { $gte: startOfWeek },
        };

        if (clienteId) {
            matchStage.clienteObjId = new Types.ObjectId(clienteId);
        }

        return this.reclamoModel.aggregate([
            {
                $addFields: {
                    clienteObjId: { $toObjectId: '$cliente' }
                }
            },
            { $match: matchStage },
            {
                $group: {
                    _id: { $dayOfWeek: '$createdAt' },
                    count: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                    dayOfWeek: '$_id',
                    count: 1,
                },
            },
        ]).exec();
    }

    async getReclamosPorArea(clienteId?: string): Promise<{ name: string; value: number }[]> {
        const matchStage: any = {};

        if (clienteId) {
            matchStage.clienteObjId = new Types.ObjectId(clienteId);
        }

        const results = await this.reclamoModel.aggregate([
            {
                $addFields: {
                    areaObjId: { $toObjectId: '$area' },
                    clienteObjId: { $toObjectId: '$cliente' }
                }
            },
            { $match: matchStage },
            {
                $group: {
                    _id: '$areaObjId',
                    count: { $sum: 1 },
                },
            },
            {
                $lookup: {
                    from: 'areas', // Collection name for areas
                    localField: '_id',
                    foreignField: '_id',
                    as: 'areaInfo',
                },
            },
            {
                $unwind: '$areaInfo',
            },
            {
                $project: {
                    _id: 0,
                    name: '$areaInfo.nombre',
                    value: '$count',
                },
            },
        ]).exec();

        return results;
    }
}


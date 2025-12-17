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
            .populate({ path: 'tipo', select: 'nombre descripcion' })
            .populate({ path: 'estado', select: 'nombre descripcion color' })
            .populate({ path: 'area', select: 'nombre descripcion' })
            .exec();
    }

    async findOne(id: string): Promise<Reclamo | null> {
        return this.reclamoModel.findById(id)
            .populate('cliente')
            .populate('proyecto')
            .populate({ path: 'tipo', select: 'nombre descripcion' })
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
            .populate({ path: 'tipo', select: 'nombre descripcion' })
            .populate({ path: 'estado', select: 'nombre descripcion color' })
            .populate({ path: 'area', select: 'nombre descripcion' })
            .exec();
    }

    async remove(id: string): Promise<Reclamo | null> {
        return this.reclamoModel.findByIdAndDelete(id).exec();
    }

    async getStats(clienteId?: string, cerradoId?: string): Promise<{ total: number; thisMonth: number; lastMonth: number; closed: number; inProcess: number; avgResolutionDays: number }> {
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
                    ],
                    // Calculate average resolution time (in milliseconds) for closed reclamos
                    avgResolution: [
                        { $match: cerradoId ? { estadoObjId: new Types.ObjectId(cerradoId) } : {} },
                        // Ensure historial has at least one entry
                        { $match: { $expr: { $gt: [{ $size: { $ifNull: ['$historial', []] } }, 0] } } },
                        { $addFields: { firstHistDate: { $arrayElemAt: ['$historial.fecha', 0] } } },
                        { $addFields: { resolutionMillis: { $subtract: [{ $toDate: '$updatedAt' }, { $toDate: '$firstHistDate' }] } } },
                        {
                            $group: {
                                _id: null,
                                avgMillis: { $avg: '$resolutionMillis' }
                            }
                        }
                    ]
                }
            }
        ];

        const results = await this.reclamoModel.aggregate(statsPipeline).exec();
        const stats = results[0];

        const avgMillis = stats.avgResolution && stats.avgResolution[0] ? stats.avgResolution[0].avgMillis : null;
        const avgDays = avgMillis ? (avgMillis / (1000 * 60 * 60 * 24)) : 0;

        return {
            total: stats.total[0]?.count || 0,
            thisMonth: stats.thisMonth[0]?.count || 0,
            lastMonth: stats.lastMonth[0]?.count || 0,
            closed: stats.closed[0]?.count || 0,
            inProcess: stats.inProcess[0]?.count || 0,
            avgResolutionDays: Number(avgDays.toFixed(2))
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

    async getReclamosPorTipo(clienteId?: string): Promise<{ name: string; value: number }[]> {
        const matchStage: any = {};

        if (clienteId) {
            matchStage.clienteObjId = new Types.ObjectId(clienteId);
        }

        const results = await this.reclamoModel.aggregate([
            {
                $addFields: {
                    tipoObjId: { $toObjectId: '$tipo' },
                    clienteObjId: { $toObjectId: '$cliente' }
                }
            },
            { $match: matchStage },
            {
                $group: {
                    _id: '$tipoObjId',
                    count: { $sum: 1 },
                },
            },
            {
                $lookup: {
                    from: 'tiporeclamos',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'tipoInfo',
                },
            },
            {
                $unwind: { path: '$tipoInfo', preserveNullAndEmptyArrays: true },
            },
            {
                $project: {
                    _id: 0,
                    name: { $ifNull: ['$tipoInfo.nombre', 'Sin tipo'] },
                    value: '$count',
                },
            },
            { $sort: { value: -1 } }
        ]).exec();

        return results;
    }

    async getReclamosPorResponsable(clienteId?: string, cerradoId?: string): Promise<any[]> {
        const matchStage: any = {};

        if (clienteId) {
            matchStage.clienteObjId = new Types.ObjectId(clienteId);
        }

        // Only claims with responsables assigned
        matchStage.responsables = { $exists: true, $ne: [] };

        const results = await this.reclamoModel.aggregate([
            {
                $addFields: {
                    estadoObjId: { $toObjectId: '$estado' },
                    clienteObjId: { $toObjectId: '$cliente' }
                }
            },
            { $match: matchStage },
            // Unwind responsables array to get one document per responsable
            { $unwind: '$responsables' },
            {
                $group: {
                    _id: '$responsables',
                    asignados: { $sum: 1 }, // Total claims assigned
                    enProceso: {
                        $sum: {
                            $cond: [
                                cerradoId
                                    ? { $ne: ['$estadoObjId', new Types.ObjectId(cerradoId)] }
                                    : true,
                                1,
                                0
                            ]
                        }
                    },
                    resueltos: {
                        $sum: {
                            $cond: [
                                cerradoId
                                    ? { $eq: ['$estadoObjId', new Types.ObjectId(cerradoId)] }
                                    : false,
                                1,
                                0
                            ]
                        }
                    }
                },
            },
            {
                $project: {
                    _id: 0,
                    responsable: '$_id',
                    asignados: 1,
                    enProceso: 1,
                    resueltos: 1
                },
            },
            { $sort: { asignados: -1 } },
            { $limit: 10 } // Top 10 responsables
        ]).exec();

        return results;
    }
}


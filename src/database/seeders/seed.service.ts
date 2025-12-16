import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TipoProyecto, TipoProyectoDocument } from '../../tipo-proyecto/schemas/tipo-proyecto.schema';
import { EstadoProyecto, EstadoProyectoDocument } from '../../estado-proyecto/schemas/estado-proyecto.schema';
import { EstadoReclamo, EstadoReclamoDocument } from '../../estado-reclamo/schemas/estado-reclamo.schema';

@Injectable()
export class SeedService implements OnModuleInit {
    private readonly logger = new Logger(SeedService.name);

    constructor(
        @InjectModel(TipoProyecto.name) private tipoProyectoModel: Model<TipoProyectoDocument>,
        @InjectModel(EstadoProyecto.name) private estadoProyectoModel: Model<EstadoProyectoDocument>,
        @InjectModel(EstadoReclamo.name) private estadoReclamoModel: Model<EstadoReclamoDocument>,
    ) { }

    async onModuleInit() {
        await this.seed();
    }

    async seed() {
        await this.seedTipoProyecto();
        await this.seedEstadoProyecto();
        await this.seedEstadoReclamo();
        this.logger.log('Seeding completed');
    }

    private async seedTipoProyecto() {
        const count = await this.tipoProyectoModel.countDocuments().exec();
        if (count === 0) {
            const tipos = [
                { nombre: 'DESARROLLO_SOFTWARE', descripcion: 'Proyectos de desarrollo de software' },
                { nombre: 'MARKETING', descripcion: 'Proyectos de marketing y publicidad' },
                { nombre: 'CONSULTORIA', descripcion: 'Servicios de consultoría' },
                { nombre: 'OTRO', descripcion: 'Otros tipos de proyectos' },
            ];
            await this.tipoProyectoModel.insertMany(tipos);
            this.logger.log('TipoProyecto seeded');
        }
    }

    private async seedEstadoProyecto() {
        const count = await this.estadoProyectoModel.countDocuments().exec();
        if (count === 0) {
            const estados = [
                { nombre: 'ACTIVO', descripcion: 'El proyecto está en curso' },
                { nombre: 'PAUSADO', descripcion: 'El proyecto está detenido temporalmente' },
                { nombre: 'FINALIZADO', descripcion: 'El proyecto ha concluido' },
                { nombre: 'CANCELADO', descripcion: 'El proyecto ha sido cancelado' },
            ];
            await this.estadoProyectoModel.insertMany(estados);
            this.logger.log('EstadoProyecto seeded');
        }
    }

    private async seedEstadoReclamo() {
        const count = await this.estadoReclamoModel.countDocuments().exec();
        if (count === 0) {
            const estados = [
                { nombre: 'Pendiente', descripcion: 'Reclamo recibido y pendiente de asignación', color: '#FFA500' },
                { nombre: 'En Proceso', descripcion: 'Reclamo en proceso de resolución', color: '#007BFF' },
                { nombre: 'Resuelto', descripcion: 'Reclamo resuelto', color: '#28A745' },
                { nombre: 'Cerrado', descripcion: 'Reclamo cerrado', color: '#6C757D' },
            ];
            await this.estadoReclamoModel.insertMany(estados);
            this.logger.log('EstadoReclamo seeded');
        }
    }
}

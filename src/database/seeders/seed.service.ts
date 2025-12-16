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
                { nombre: 'Recibido', descripcion: 'El área de soporte recibe el reclamo, indica al cliente que su solicitud fue recibida.', color: '#4CAF50' },
                { nombre: 'Asignado', descripcion: 'El reclamo fue asignado a un área para su procesamiento', color: '#2196F3' },
                { nombre: 'Clasificado', descripcion: 'Se asigna la prioridad, criticidad y estado a recibido', color: '#90CAF9' },
                { nombre: 'En proceso', descripcion: 'El área esta trabajando en el reclamo', color: '#1976D2' },
                { nombre: 'Reasignado', descripcion: 'Se reasigna el reclamo una nueva área', color: '#1565C0' },
                { nombre: 'Resuelto', descripcion: 'Se propone o se implementa la solución', color: '#3F51B5' },
                { nombre: 'En espera de confirmación', descripcion: 'En espera de la confirmación del cliente de que esta todo correcto', color: '#303F9F' },
                { nombre: 'Cerrado', descripcion: 'Cliente confirma que todo funciona correctamente o que su reclamo fue atendido con satisfacción', color: '#006064' },
            ];
            await this.estadoReclamoModel.insertMany(estados);
            this.logger.log('EstadoReclamo seeded');
        }
    }
}

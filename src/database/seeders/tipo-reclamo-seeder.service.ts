import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TipoReclamo, TipoReclamoDocument } from '../../tipo-reclamo/schemas/tipo-reclamo.schema';

@Injectable()
export class TipoReclamoSeederService {
    constructor(
        @InjectModel(TipoReclamo.name)
        private readonly tipoReclamoModel: Model<TipoReclamoDocument>,
    ) { }

    async seed() {
        const types = [
            { nombre: 'Hardware', descripcion: 'Problemas relacionados con equipos físicos (PC, mouse, teclado, etc.)' },
            { nombre: 'Software', descripcion: 'Problemas con programas, sistemas operativos o aplicaciones.' },
            { nombre: 'Conectividad', descripcion: 'Problemas de red, internet o VPN.' },
            { nombre: 'Acceso', descripcion: 'Problemas de login, permisos o contraseñas.' },
            { nombre: 'Otros', descripcion: 'Otros tipos de reclamos no categorizados.' },
        ];

        for (const type of types) {
            const exists = await this.tipoReclamoModel.findOne({ nombre: type.nombre });
            if (!exists) {
                await this.tipoReclamoModel.create(type);
                console.log(`TipoReclamo '${type.nombre}' created.`);
            }
        }
    }
}

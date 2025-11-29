import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProyectoService } from './proyecto.service';
import { ProyectoController } from './proyecto.controller';
import { Proyecto, ProyectoSchema } from './schemas/proyecto.schema';

import { Reclamo, ReclamoSchema } from '../reclamo/schemas/reclamo.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Proyecto.name, schema: ProyectoSchema },
            { name: Reclamo.name, schema: ReclamoSchema },
        ]),
    ],
    controllers: [ProyectoController],
    providers: [ProyectoService],
    exports: [ProyectoService],
})
export class ProyectoModule { }

import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProyectoService } from './proyecto.service';
import { ProyectoController } from './proyecto.controller';
import { Proyecto, ProyectoSchema } from './schemas/proyecto.schema';

import { Reclamo, ReclamoSchema } from '../reclamo/schemas/reclamo.schema';
import { ClienteModule } from '../cliente/cliente.module';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Proyecto.name, schema: ProyectoSchema },
            { name: Reclamo.name, schema: ReclamoSchema },
        ]),
        forwardRef(() => ClienteModule),
        HttpModule,
    ],
    controllers: [ProyectoController],
    providers: [ProyectoService],
    exports: [ProyectoService],
})
export class ProyectoModule { }

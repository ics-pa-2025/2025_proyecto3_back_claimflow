import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeedService } from './seed.service';
import { TipoProyecto, TipoProyectoSchema } from '../../tipo-proyecto/schemas/tipo-proyecto.schema';
import { EstadoProyecto, EstadoProyectoSchema } from '../../estado-proyecto/schemas/estado-proyecto.schema';
import { EstadoReclamo, EstadoReclamoSchema } from '../../estado-reclamo/schemas/estado-reclamo.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: TipoProyecto.name, schema: TipoProyectoSchema },
            { name: EstadoProyecto.name, schema: EstadoProyectoSchema },
            { name: EstadoReclamo.name, schema: EstadoReclamoSchema },
        ]),
    ],
    providers: [SeedService],
    exports: [SeedService],
})
export class SeedModule { }

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SeedService } from './seed.service';
import { TipoProyecto, TipoProyectoSchema } from '../../tipo-proyecto/schemas/tipo-proyecto.schema';
import { EstadoProyecto, EstadoProyectoSchema } from '../../estado-proyecto/schemas/estado-proyecto.schema';
import { EstadoReclamo, EstadoReclamoSchema } from '../../estado-reclamo/schemas/estado-reclamo.schema';
import { Area, AreaSchema } from '../../area/schemas/area.schema';
import { TipoReclamoSeederService } from './tipo-reclamo-seeder.service';
import { TipoReclamoModule } from '../../tipo-reclamo/tipo-reclamo.module';
import { TipoReclamo, TipoReclamoSchema } from '../../tipo-reclamo/schemas/tipo-reclamo.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: TipoProyecto.name, schema: TipoProyectoSchema },
            { name: EstadoProyecto.name, schema: EstadoProyectoSchema },
            { name: EstadoReclamo.name, schema: EstadoReclamoSchema },
            { name: Area.name, schema: AreaSchema },
            { name: TipoReclamo.name, schema: TipoReclamoSchema },
        ]),
        TipoReclamoModule,
    ],
    providers: [SeedService, TipoReclamoSeederService],
    exports: [SeedService],
})
export class SeedModule { }

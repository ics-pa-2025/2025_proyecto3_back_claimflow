import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EstadoReclamoService } from './estado-reclamo.service';
import { EstadoReclamoController } from './estado-reclamo.controller';
import { EstadoReclamoRepository } from './estado-reclamo.repository';
import { EstadoReclamo, EstadoReclamoSchema } from './schemas/estado-reclamo.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: EstadoReclamo.name, schema: EstadoReclamoSchema }]),
    ],
    controllers: [EstadoReclamoController],
    providers: [EstadoReclamoService, EstadoReclamoRepository],
    exports: [EstadoReclamoService], // Export if needed by other modules
})
export class EstadoReclamoModule { }

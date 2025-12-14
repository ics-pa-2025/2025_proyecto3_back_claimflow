import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReclamoService } from './reclamo.service';
import { ReclamoController } from './reclamo.controller';
import { Reclamo, ReclamoSchema } from './schemas/reclamo.schema';
import { ReclamoRepository } from './reclamo.repository';
import { EstadoReclamoModule } from '../estado-reclamo/estado-reclamo.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Reclamo.name, schema: ReclamoSchema }]),
        EstadoReclamoModule,
    ],
    controllers: [ReclamoController],
    providers: [ReclamoService, ReclamoRepository],
})
export class ReclamoModule { }

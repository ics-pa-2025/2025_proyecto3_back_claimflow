import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReclamoService } from './reclamo.service';
import { ReclamoController } from './reclamo.controller';
import { Reclamo, ReclamoSchema } from './schemas/reclamo.schema';
import { ReclamoRepository } from './reclamo.repository';
import { EstadoReclamoModule } from '../estado-reclamo/estado-reclamo.module';
import { AreaModule } from '../area/area.module';
import { ClienteModule } from '../cliente/cliente.module';
import { HttpModule } from '@nestjs/axios';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Reclamo.name, schema: ReclamoSchema }]),
        EstadoReclamoModule,
        AreaModule,
        ClienteModule,
        HttpModule,
    ],
    controllers: [ReclamoController],
    providers: [ReclamoService, ReclamoRepository],
})
export class ReclamoModule { }

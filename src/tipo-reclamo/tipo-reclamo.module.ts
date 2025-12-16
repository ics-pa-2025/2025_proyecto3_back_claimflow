import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TipoReclamoService } from './tipo-reclamo.service';
import { TipoReclamoController } from './tipo-reclamo.controller';
import { TipoReclamo, TipoReclamoSchema } from './schemas/tipo-reclamo.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: TipoReclamo.name, schema: TipoReclamoSchema }]),
    ],
    controllers: [TipoReclamoController],
    providers: [TipoReclamoService],
    exports: [TipoReclamoService]
})
export class TipoReclamoModule { }

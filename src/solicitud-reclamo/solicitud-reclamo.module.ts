
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SolicitudReclamoService } from './solicitud-reclamo.service';
import { SolicitudReclamoController } from './solicitud-reclamo.controller';
import { SolicitudReclamo, SolicitudReclamoSchema } from './schemas/solicitud-reclamo.schema';
import { SolicitudReclamoRepository } from './solicitud-reclamo.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SolicitudReclamo.name, schema: SolicitudReclamoSchema },
    ]),
  ],
  controllers: [SolicitudReclamoController],
  providers: [SolicitudReclamoService, SolicitudReclamoRepository],
})
export class SolicitudReclamoModule {}

import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SolicitudReclamoService } from './solicitud-reclamo.service';
import { SolicitudReclamoController } from './solicitud-reclamo.controller';
import { SolicitudReclamo, SolicitudReclamoSchema } from './schemas/solicitud-reclamo.schema';
import { SolicitudReclamoRepository } from './solicitud-reclamo.repository';
import { ReclamoModule } from '../reclamo/reclamo.module';
import { EstadoReclamoModule } from '../estado-reclamo/estado-reclamo.module';
import { ArchivoModule } from '../archivo/archivo.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: SolicitudReclamo.name, schema: SolicitudReclamoSchema }]),
    forwardRef(() => ReclamoModule),
    EstadoReclamoModule,
    forwardRef(() => ArchivoModule),
  ],
  controllers: [SolicitudReclamoController],
  providers: [SolicitudReclamoService, SolicitudReclamoRepository],
  exports: [SolicitudReclamoService, SolicitudReclamoRepository],
})
export class SolicitudReclamoModule { }

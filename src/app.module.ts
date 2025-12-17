import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ClienteModule } from './cliente/cliente.module';
import { ReclamoModule } from './reclamo/reclamo.module';
import { TipoProyectoModule } from './tipo-proyecto/tipo-proyecto.module';
import { EstadoProyectoModule } from './estado-proyecto/estado-proyecto.module';
import { ProyectoModule } from './proyecto/proyecto.module';
import { EstadoReclamoModule } from './estado-reclamo/estado-reclamo.module';
import { AreaModule } from './area/area.module';

import { SeedModule } from './database/seeders/seed.module';
import { ConnectionModule } from './database/connection/connection.module';
import { SolicitudReclamoModule } from './solicitud-reclamo/solicitud-reclamo.module';
import { MensajeModule } from './mensaje/mensaje.module';
import { TipoReclamoModule } from './tipo-reclamo/tipo-reclamo.module';
import { ArchivoModule } from './archivo/archivo.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ClienteModule,
    ReclamoModule,
    TipoProyectoModule,
    EstadoProyectoModule,
    ProyectoModule,
    EstadoReclamoModule,
    AreaModule,
    TipoReclamoModule,
    SeedModule,
    ConnectionModule,
    SolicitudReclamoModule,
    MensajeModule,
    ArchivoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClienteModule } from './cliente/cliente.module';
import { ReclamoModule } from './reclamo/reclamo.module';
import { TipoProyectoModule } from './tipo-proyecto/tipo-proyecto.module';
import { EstadoProyectoModule } from './estado-proyecto/estado-proyecto.module';
import { ProyectoModule } from './proyecto/proyecto.module';
import { SeedModule } from './database/seeders/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    ClienteModule,
    ReclamoModule,
    TipoProyectoModule,
    EstadoProyectoModule,
    ProyectoModule,
    SeedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

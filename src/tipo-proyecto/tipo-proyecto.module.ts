import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TipoProyectoService } from './tipo-proyecto.service';
import { TipoProyectoController } from './tipo-proyecto.controller';
import {
  TipoProyecto,
  TipoProyectoSchema,
} from './schemas/tipo-proyecto.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TipoProyecto.name, schema: TipoProyectoSchema },
    ]),
  ],
  controllers: [TipoProyectoController],
  providers: [TipoProyectoService],
  exports: [TipoProyectoService],
})
export class TipoProyectoModule {}

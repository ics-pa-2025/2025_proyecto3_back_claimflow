import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EstadoProyectoService } from './estado-proyecto.service';
import { EstadoProyectoController } from './estado-proyecto.controller';
import { EstadoProyecto, EstadoProyectoSchema } from './schemas/estado-proyecto.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: EstadoProyecto.name, schema: EstadoProyectoSchema }]),
    ],
    controllers: [EstadoProyectoController],
    providers: [EstadoProyectoService],
    exports: [EstadoProyectoService],
})
export class EstadoProyectoModule { }

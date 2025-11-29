import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { TipoProyecto } from '../../tipo-proyecto/schemas/tipo-proyecto.schema';
import { EstadoProyecto } from '../../estado-proyecto/schemas/estado-proyecto.schema';
import { Cliente } from '../../cliente/schemas/cliente.schema';

export type ProyectoDocument = Proyecto & Document;

@Schema({ timestamps: true })
export class Proyecto {
    @Prop({ required: true })
    nombre: string;

    @Prop({ required: true })
    descripcion: string;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'TipoProyecto', required: true })
    tipo: TipoProyecto;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Cliente', required: true })
    clienteId: Cliente;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'EstadoProyecto', required: true })
    estado: EstadoProyecto;

    @Prop({ required: true })
    fechaInicio: Date;

    @Prop({ required: true })
    fechaFin: Date;

    @Prop({ default: null })
    deletedAt: Date;
}

export const ProyectoSchema = SchemaFactory.createForClass(Proyecto);

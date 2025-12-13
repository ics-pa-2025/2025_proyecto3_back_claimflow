import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { TipoProyecto } from '../../tipo-proyecto/schemas/tipo-proyecto.schema';
import { EstadoProyecto } from '../../estado-proyecto/schemas/estado-proyecto.schema';
import { Cliente } from '../../cliente/schemas/cliente.schema';

export type ProyectoDocument = Proyecto & Document;

@Schema({ timestamps: true })
export class Proyecto {
  @Prop({ required: true, unique: true })
  nombre: string;

  @Prop({ required: true })
  descripcion: string;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'TipoProyecto',
    required: false,
  })
  tipo: TipoProyecto;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Cliente',
    required: false,
  })
  clienteId: Cliente;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'EstadoProyecto',
    required: false,
  })
  estado: EstadoProyecto;

  @Prop({ required: false })
  fechaInicio: Date;

  @Prop({ required: false })
  fechaFin: Date;

  @Prop({ default: null })
  deletedAt: Date;
}

export const ProyectoSchema = SchemaFactory.createForClass(Proyecto);

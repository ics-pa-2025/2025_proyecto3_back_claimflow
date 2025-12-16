import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class SolicitudReclamo extends Document {
  @Prop({ required: true })
  tipo: string;

  @Prop({ required: true })
  descripcion: string;

  @Prop({ type: [String], default: [] })
  evidencia: string[];

  @Prop({ type: Types.ObjectId, ref: 'Area', required: true })
  area: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Cliente', required: true })
  cliente: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Proyecto', required: true })
  proyecto: Types.ObjectId;
}

export type SolicitudReclamoDocument = SolicitudReclamo & Document;
export const SolicitudReclamoSchema = SchemaFactory.createForClass(SolicitudReclamo);
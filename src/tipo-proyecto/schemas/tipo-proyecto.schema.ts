import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TipoProyectoDocument = TipoProyecto & Document;

@Schema({ timestamps: true })
export class TipoProyecto {
  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true })
  descripcion: string;

  @Prop({ default: null })
  deletedAt: Date;
}

export const TipoProyectoSchema = SchemaFactory.createForClass(TipoProyecto);

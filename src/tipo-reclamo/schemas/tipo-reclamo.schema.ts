import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TipoReclamoDocument = TipoReclamo & Document;

@Schema({ timestamps: true })
export class TipoReclamo {
    @Prop({ required: true })
    nombre: string;

    @Prop({ required: false })
    descripcion: string;

    @Prop({ default: true })
    activo: boolean;
}

export const TipoReclamoSchema = SchemaFactory.createForClass(TipoReclamo);

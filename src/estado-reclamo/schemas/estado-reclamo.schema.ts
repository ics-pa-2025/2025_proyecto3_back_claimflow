import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EstadoReclamoDocument = EstadoReclamo & Document;

@Schema()
export class EstadoReclamo {
    @Prop({ required: true, unique: true })
    nombre: string;

    @Prop({ required: true })
    descripcion: string;

    @Prop({ required: true }) // Hex color code for UI
    color: string;

    @Prop({ default: true })
    activo: boolean;
}

export const EstadoReclamoSchema = SchemaFactory.createForClass(EstadoReclamo);

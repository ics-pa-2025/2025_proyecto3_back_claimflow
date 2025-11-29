import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type EstadoProyectoDocument = EstadoProyecto & Document;

@Schema({ timestamps: true })
export class EstadoProyecto {
    @Prop({ required: true })
    nombre: string;

    @Prop({ required: true })
    descripcion: string;

    @Prop({ default: null })
    deletedAt: Date;
}

export const EstadoProyectoSchema = SchemaFactory.createForClass(EstadoProyecto);

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { Reclamo } from '../../reclamo/schemas/reclamo.schema';

export type MensajeDocument = Mensaje & Document;

export interface EmisorInfo {
    tipo: 'cliente' | 'usuario';
    id: string;
    nombre?: string;
}

@Schema({ timestamps: true })
export class Mensaje {
    @Prop({ required: true })
    contenido: string;

    @Prop({ type: Object, required: true })
    emisor: EmisorInfo;

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Reclamo', required: true })
    reclamoId: Reclamo;

    @Prop({ default: false })
    leido: boolean;

    @Prop({ type: Date })
    fechaCreacion: Date;

    @Prop({ type: Date, default: null })
    fechaEliminacion: Date;
}

export const MensajeSchema = SchemaFactory.createForClass(Mensaje);

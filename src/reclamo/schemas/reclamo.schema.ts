import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, Document } from 'mongoose';

export type ReclamoDocument = Reclamo & Document;

@Schema()
export class Historial {
    @Prop({ required: true })
    fecha: Date;

    @Prop({ required: true })
    accion: string;

    @Prop({ required: true })
    responsable: string; // Could be a user ID or name
}

const HistorialSchema = SchemaFactory.createForClass(Historial);

@Schema()
export class Reclamo {
    @Prop({ required: true })
    tipo: string;

    @Prop({ required: true })
    prioridad: string;

    @Prop({ required: true })
    criticidad: string;

    @Prop({ required: true })
    descripcion: string;

    @Prop()
    evidencia: string; // URL or path to file

    @Prop({ type: Types.ObjectId, ref: 'EstadoReclamo' })
    estado: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Area', required: true })
    area: Types.ObjectId;

    @Prop({ type: [HistorialSchema], default: [] })
    historial: Historial[];

    @Prop({ type: Types.ObjectId, ref: 'Cliente', required: true })
    cliente: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Proyecto', required: true })
    proyecto: Types.ObjectId;
}

export const ReclamoSchema = SchemaFactory.createForClass(Reclamo);

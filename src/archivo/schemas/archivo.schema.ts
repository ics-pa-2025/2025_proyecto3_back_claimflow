import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ArchivoDocument = Archivo & Document;

@Schema({ timestamps: true })
export class Archivo {
    @Prop({ required: true })
    nombreOriginal: string;

    @Prop({ required: true })
    nombreAlmacenado: string;

    @Prop({ required: true })
    rutaArchivo: string;

    @Prop({ required: true })
    mimeType: string;

    @Prop({ required: true })
    tamanoBytes: number;

    @Prop({ type: Types.ObjectId, ref: 'Reclamo', required: true })
    reclamoId: Types.ObjectId;
}

export const ArchivoSchema = SchemaFactory.createForClass(Archivo);

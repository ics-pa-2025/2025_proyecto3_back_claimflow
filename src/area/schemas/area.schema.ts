import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AreaDocument = Area & Document;

@Schema()
export class Area {
    @Prop({ required: true, unique: true })
    nombre: string;

    @Prop()
    descripcion: string;
}

export const AreaSchema = SchemaFactory.createForClass(Area);

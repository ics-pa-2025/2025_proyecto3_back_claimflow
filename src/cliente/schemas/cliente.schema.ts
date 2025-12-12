import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ClienteDocument = HydratedDocument<Cliente>;

@Schema()
export class Proyecto {
    @Prop({ required: true })
    nombre: string;

    @Prop({ required: true })
    tipo: string; // e.g., 'Desarrollo de software', 'Marketing', etc.
}

const ProyectoSchema = SchemaFactory.createForClass(Proyecto);

@Schema()
export class Cliente {
    @Prop({ required: true })
    nombre: string;

    @Prop({ required: true })
    apellido: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true, unique: true })
    dni: string;

    @Prop()
    telefono: string;

    @Prop({ type: [ProyectoSchema], default: [] })
    proyectos: Proyecto[];

    @Prop({ default: null })
    fechaEliminacion: Date;
}

export const ClienteSchema = SchemaFactory.createForClass(Cliente);

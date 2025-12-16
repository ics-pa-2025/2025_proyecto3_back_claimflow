import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HttpModule } from '@nestjs/axios';
import { MensajeService } from './mensaje.service';
import { MensajeController } from './mensaje.controller';
import { MensajeRepository } from './mensaje.repository';
import { ChatGateway } from './chat.gateway';
import { Mensaje, MensajeSchema } from './schemas/mensaje.schema';
import { ReclamoModule } from '../reclamo/reclamo.module';
import { ClienteModule } from '../cliente/cliente.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Mensaje.name, schema: MensajeSchema }]),
        forwardRef(() => ReclamoModule),
        forwardRef(() => ClienteModule),
        HttpModule,
    ],
    controllers: [MensajeController],
    providers: [MensajeService, MensajeRepository, ChatGateway],
    exports: [MensajeService],
})
export class MensajeModule { }

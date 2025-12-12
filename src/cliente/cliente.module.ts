import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClienteService } from './cliente.service';
import { ClienteController } from './cliente.controller';
import { Cliente, ClienteSchema } from './schemas/cliente.schema';
import { ClienteRepository } from './cliente.repository';
import { ProyectoModule } from '../proyecto/proyecto.module';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Cliente.name, schema: ClienteSchema }]),
        forwardRef(() => ProyectoModule)
    ],
    controllers: [ClienteController],
    providers: [ClienteService, ClienteRepository],
    exports: [ClienteService]
})
export class ClienteModule { }

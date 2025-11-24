import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClienteService } from './cliente.service';
import { ClienteController } from './cliente.controller';
import { Cliente, ClienteSchema } from './schemas/cliente.schema';
import { ClienteRepository } from './cliente.repository';

@Module({
    imports: [MongooseModule.forFeature([{ name: Cliente.name, schema: ClienteSchema }])],
    controllers: [ClienteController],
    providers: [ClienteService, ClienteRepository],
})
export class ClienteModule { }

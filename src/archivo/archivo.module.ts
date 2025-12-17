import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ArchivoController } from './archivo.controller';
import { ArchivoService } from './archivo.service';
import { ArchivoRepository } from './archivo.repository';
import { Archivo, ArchivoSchema } from './schemas/archivo.schema';
import { ReclamoModule } from '../reclamo/reclamo.module';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Archivo.name, schema: ArchivoSchema },
        ]),
        forwardRef(() => ReclamoModule),
    ],
    controllers: [ArchivoController],
    providers: [ArchivoService, ArchivoRepository],
    exports: [ArchivoService],
})
export class ArchivoModule { }

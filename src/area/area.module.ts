import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AreaService } from './area.service';
import { AreaController } from './area.controller';
import { AreaRepository } from './area.repository';
import { Area, AreaSchema } from './schemas/area.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Area.name, schema: AreaSchema }]),
    ],
    controllers: [AreaController],
    providers: [AreaService, AreaRepository],
    exports: [AreaService],
})
export class AreaModule { }

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Area, AreaDocument } from './schemas/area.schema';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';

@Injectable()
export class AreaRepository {
    constructor(@InjectModel(Area.name) private areaModel: Model<AreaDocument>) { }

    async create(createAreaDto: CreateAreaDto): Promise<Area> {
        const createdArea = new this.areaModel(createAreaDto);
        return createdArea.save();
    }

    async findAll(): Promise<Area[]> {
        return this.areaModel.find().exec();
    }

    async findOne(id: string): Promise<Area | null> {
        return this.areaModel.findById(id).exec();
    }

    async update(id: string, updateAreaDto: UpdateAreaDto): Promise<Area | null> {
        return this.areaModel.findByIdAndUpdate(id, updateAreaDto, { new: true }).exec();
    }

    async remove(id: string): Promise<Area | null> {
        return this.areaModel.findByIdAndDelete(id).exec();
    }
}

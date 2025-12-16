import { Injectable } from '@nestjs/common';
import { AreaRepository } from './area.repository';
import { CreateAreaDto } from './dto/create-area.dto';
import { UpdateAreaDto } from './dto/update-area.dto';

@Injectable()
export class AreaService {
    constructor(private readonly areaRepository: AreaRepository) { }

    create(createAreaDto: CreateAreaDto) {
        return this.areaRepository.create(createAreaDto);
    }

    findAll() {
        return this.areaRepository.findAll();
    }

    findOne(id: string) {
        return this.areaRepository.findOne(id);
    }

    update(id: string, updateAreaDto: UpdateAreaDto) {
        return this.areaRepository.update(id, updateAreaDto);
    }

    remove(id: string) {
        return this.areaRepository.remove(id);
    }
}

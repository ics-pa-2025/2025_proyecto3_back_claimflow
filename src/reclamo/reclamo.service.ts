import { Injectable } from '@nestjs/common';
import { ReclamoRepository } from './reclamo.repository';
import { CreateReclamoDto } from './dto/create-reclamo.dto';

@Injectable()
export class ReclamoService {
    constructor(private readonly reclamoRepository: ReclamoRepository) { }

    create(createReclamoDto: CreateReclamoDto) {
        return this.reclamoRepository.create(createReclamoDto);
    }

    findAll() {
        return this.reclamoRepository.findAll();
    }

    findOne(id: string) {
        return this.reclamoRepository.findOne(id);
    }

    update(id: string, updateReclamoDto: any) {
        return this.reclamoRepository.update(id, updateReclamoDto);
    }

    remove(id: string) {
        return this.reclamoRepository.remove(id);
    }
}

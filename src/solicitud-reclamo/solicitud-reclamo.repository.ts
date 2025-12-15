import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SolicitudReclamo, SolicitudReclamoDocument } from './schemas/solicitud-reclamo.schema';
import { CreateSolicitudReclamoDto } from './dto/create-solicitud-reclamo.dto';

@Injectable()
export class SolicitudReclamoRepository {
  constructor(
    @InjectModel(SolicitudReclamo.name)
    private readonly solicitudReclamoModel: Model<SolicitudReclamoDocument>,
  ) {}

  async create(createDto: CreateSolicitudReclamoDto): Promise<SolicitudReclamo> {
    const plainDto = JSON.parse(JSON.stringify(createDto));
    const created = new this.solicitudReclamoModel(plainDto);
    return created.save();
  }

  async findAll(): Promise<SolicitudReclamo[]> {
    return this.solicitudReclamoModel.find()
      .populate('area')
      .populate('cliente')
      .populate('proyecto')
      .exec();
  }

  async findOne(id: string): Promise<SolicitudReclamo | null> {
    return this.solicitudReclamoModel.findById(id)
      .populate('area')
      .populate('cliente')
      .populate('proyecto')
      .exec();
  }

  async update(id: string, updateDto: any): Promise<SolicitudReclamo | null> {
    return this.solicitudReclamoModel.findByIdAndUpdate(id, updateDto, { new: true }).exec();
  }

  async remove(id: string): Promise<SolicitudReclamo | null> {
    return this.solicitudReclamoModel.findByIdAndDelete(id).exec();
  }
}

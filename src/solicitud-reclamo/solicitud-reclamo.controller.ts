import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SolicitudReclamoService } from './solicitud-reclamo.service';
import { CreateSolicitudReclamoDto } from './dto/create-solicitud-reclamo.dto';
import { UpdateSolicitudReclamoDto } from './dto/update-solicitud-reclamo.dto';

@Controller('solicitud-reclamo')
export class SolicitudReclamoController {
  constructor(private readonly solicitudReclamoService: SolicitudReclamoService) {}

  @Post()
  create(@Body() createSolicitudReclamoDto: CreateSolicitudReclamoDto) {
    return this.solicitudReclamoService.create(createSolicitudReclamoDto);
  }

  @Get()
  findAll() {
    return this.solicitudReclamoService.findAll();
  }


  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.solicitudReclamoService.findOne(id);
  }


  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSolicitudReclamoDto: UpdateSolicitudReclamoDto) {
    return this.solicitudReclamoService.update(id, updateSolicitudReclamoDto);
  }


  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.solicitudReclamoService.remove(id);
  }
}

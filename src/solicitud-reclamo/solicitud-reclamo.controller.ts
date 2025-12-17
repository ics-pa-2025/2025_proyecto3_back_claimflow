import { ApiTags } from '@nestjs/swagger';
import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { SolicitudReclamoService } from './solicitud-reclamo.service';
import { CreateSolicitudReclamoDto } from './dto/create-solicitud-reclamo.dto';
import { UpdateSolicitudReclamoDto } from './dto/update-solicitud-reclamo.dto';

@ApiTags('solicitud-reclamo')
@Controller('solicitud-reclamo')
export class SolicitudReclamoController {
  constructor(private readonly solicitudReclamoService: SolicitudReclamoService) { }


  @Post()
  @UseInterceptors(AnyFilesInterceptor({
    storage: diskStorage({
      destination: './public',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + extname(file.originalname));
      },
    }),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB por archivo
  }))
  async create(
    @Body() createSolicitudReclamoDto: CreateSolicitudReclamoDto,
    @UploadedFiles() files: Array<Express.Multer.File>
  ) {
    // Guardar paths de archivos en evidencia
    if (files && files.length > 0) {
      createSolicitudReclamoDto.evidencia = files.map(f => f.filename);
    }
    return this.solicitudReclamoService.create(createSolicitudReclamoDto, files);
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

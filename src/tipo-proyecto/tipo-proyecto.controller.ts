import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TipoProyectoService } from './tipo-proyecto.service';
import { CreateTipoProyectoDto } from './dto/create-tipo-proyecto.dto';
import { UpdateTipoProyectoDto } from './dto/update-tipo-proyecto.dto';

@ApiTags('tipo-proyecto')
@Controller('tipo-proyecto')
export class TipoProyectoController {
  constructor(private readonly tipoProyectoService: TipoProyectoService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new TipoProyecto' })
  @ApiResponse({
    status: 201,
    description: 'The TipoProyecto has been successfully created.',
  })
  create(@Body() createTipoProyectoDto: CreateTipoProyectoDto) {
    return this.tipoProyectoService.create(createTipoProyectoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all TipoProyectos' })
  @ApiResponse({ status: 200, description: 'Return all TipoProyectos.' })
  findAll() {
    return this.tipoProyectoService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a TipoProyecto by id' })
  @ApiResponse({ status: 200, description: 'Return the TipoProyecto.' })
  @ApiResponse({ status: 404, description: 'TipoProyecto not found.' })
  findOne(@Param('id') id: string) {
    return this.tipoProyectoService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a TipoProyecto' })
  @ApiResponse({
    status: 200,
    description: 'The TipoProyecto has been successfully updated.',
  })
  @ApiResponse({ status: 404, description: 'TipoProyecto not found.' })
  update(
    @Param('id') id: string,
    @Body() updateTipoProyectoDto: UpdateTipoProyectoDto,
  ) {
    return this.tipoProyectoService.update(id, updateTipoProyectoDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a TipoProyecto (Soft Delete)' })
  @ApiResponse({
    status: 200,
    description: 'The TipoProyecto has been successfully deleted.',
  })
  @ApiResponse({ status: 404, description: 'TipoProyecto not found.' })
  remove(@Param('id') id: string) {
    return this.tipoProyectoService.remove(id);
  }
}

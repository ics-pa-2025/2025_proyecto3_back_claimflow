import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { EstadoProyectoService } from './estado-proyecto.service';
import { CreateEstadoProyectoDto } from './dto/create-estado-proyecto.dto';
import { UpdateEstadoProyectoDto } from './dto/update-estado-proyecto.dto';

@ApiTags('estado-proyecto')
@Controller('estado-proyecto')
export class EstadoProyectoController {
    constructor(private readonly estadoProyectoService: EstadoProyectoService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new EstadoProyecto' })
    @ApiResponse({ status: 201, description: 'The EstadoProyecto has been successfully created.' })
    create(@Body() createEstadoProyectoDto: CreateEstadoProyectoDto) {
        return this.estadoProyectoService.create(createEstadoProyectoDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all EstadoProyectos' })
    @ApiResponse({ status: 200, description: 'Return all EstadoProyectos.' })
    findAll() {
        return this.estadoProyectoService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a EstadoProyecto by id' })
    @ApiResponse({ status: 200, description: 'Return the EstadoProyecto.' })
    @ApiResponse({ status: 404, description: 'EstadoProyecto not found.' })
    findOne(@Param('id') id: string) {
        return this.estadoProyectoService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a EstadoProyecto' })
    @ApiResponse({ status: 200, description: 'The EstadoProyecto has been successfully updated.' })
    @ApiResponse({ status: 404, description: 'EstadoProyecto not found.' })
    update(@Param('id') id: string, @Body() updateEstadoProyectoDto: UpdateEstadoProyectoDto) {
        return this.estadoProyectoService.update(id, updateEstadoProyectoDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a EstadoProyecto (Soft Delete)' })
    @ApiResponse({ status: 200, description: 'The EstadoProyecto has been successfully deleted.' })
    @ApiResponse({ status: 404, description: 'EstadoProyecto not found.' })
    remove(@Param('id') id: string) {
        return this.estadoProyectoService.remove(id);
    }
}

import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TipoReclamoService } from './tipo-reclamo.service';
import { CreateTipoReclamoDto } from './dto/create-tipo-reclamo.dto';
import { UpdateTipoReclamoDto } from './dto/update-tipo-reclamo.dto';

@ApiTags('tipo-reclamo')
@Controller('tipo-reclamo')
export class TipoReclamoController {
    constructor(private readonly tipoReclamoService: TipoReclamoService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new TipoReclamo' })
    @ApiResponse({ status: 201, description: 'The TipoReclamo has been successfully created.' })
    create(@Body() createTipoReclamoDto: CreateTipoReclamoDto) {
        return this.tipoReclamoService.create(createTipoReclamoDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all TipoReclamos' })
    @ApiResponse({ status: 200, description: 'Return all TipoReclamos.' })
    findAll() {
        return this.tipoReclamoService.findAll();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a TipoReclamo by id' })
    @ApiResponse({ status: 200, description: 'Return the TipoReclamo.' })
    @ApiResponse({ status: 404, description: 'TipoReclamo not found.' })
    findOne(@Param('id') id: string) {
        return this.tipoReclamoService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a TipoReclamo' })
    @ApiResponse({ status: 200, description: 'The TipoReclamo has been successfully updated.' })
    @ApiResponse({ status: 404, description: 'TipoReclamo not found.' })
    update(@Param('id') id: string, @Body() updateTipoReclamoDto: UpdateTipoReclamoDto) {
        return this.tipoReclamoService.update(id, updateTipoReclamoDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a TipoReclamo' })
    @ApiResponse({ status: 200, description: 'The TipoReclamo has been successfully deleted.' })
    @ApiResponse({ status: 404, description: 'TipoReclamo not found.' })
    remove(@Param('id') id: string) {
        return this.tipoReclamoService.remove(id);
    }
}

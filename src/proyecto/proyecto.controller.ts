
import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProyectoService } from './proyecto.service';
import { CreateProyectoDto } from './dto/create-proyecto.dto';
import { UpdateProyectoDto } from './dto/update-proyecto.dto';
import { HttpService } from '@nestjs/axios';
import { Request } from 'express';
import { lastValueFrom } from 'rxjs';

@ApiTags('proyecto')
@Controller('proyecto')
export class ProyectoController {
    constructor(
        private readonly proyectoService: ProyectoService,
        private readonly httpService: HttpService,
    ) { }

    @Post()
    @ApiOperation({ summary: 'Create a new Proyecto' })
    @ApiResponse({ status: 201, description: 'The Proyecto has been successfully created.' })
    create(@Body() createProyectoDto: CreateProyectoDto) {
        return this.proyectoService.create(createProyectoDto);
    }

    @Get()
    @ApiOperation({ summary: 'Get all Proyectos' })
    @ApiResponse({ status: 200, description: 'Return all Proyectos.' })
    async findAll(@Req() request: Request) {
        const authHeader = request.headers.authorization;
        if (!authHeader) {
            return this.proyectoService.findAll();
        }

        try {
            const token = authHeader.replace('Bearer ', '');
            const url = `http://auth-service-claimflow:3001/user/me`;
            const response = await lastValueFrom(
                this.httpService.get(url, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            );

            const user = response.data;
            const userRole = user.roles && user.roles.length > 0 ? user.roles[0].name : null;

            return this.proyectoService.findAll(user.id, userRole);
        } catch (error) {
            return this.proyectoService.findAll();
        }
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get a Proyecto by id' })
    @ApiResponse({ status: 200, description: 'Return the Proyecto.' })
    @ApiResponse({ status: 404, description: 'Proyecto not found.' })
    findOne(@Param('id') id: string) {
        return this.proyectoService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update a Proyecto' })
    @ApiResponse({ status: 200, description: 'The Proyecto has been successfully updated.' })
    @ApiResponse({ status: 404, description: 'Proyecto not found.' })
    update(@Param('id') id: string, @Body() updateProyectoDto: UpdateProyectoDto) {
        return this.proyectoService.update(id, updateProyectoDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete a Proyecto (Soft Delete)' })
    @ApiResponse({ status: 200, description: 'The Proyecto has been successfully deleted.' })
    @ApiResponse({ status: 404, description: 'Proyecto not found.' })
    remove(@Param('id') id: string) {
        return this.proyectoService.remove(id);
    }

    @Get(':id/reclamos')
    @ApiOperation({ summary: 'Get all Reclamos for a Proyecto' })
    @ApiResponse({ status: 200, description: 'Return all Reclamos for the Proyecto.' })
    @ApiResponse({ status: 404, description: 'Proyecto not found.' })
    obtenerReclamos(@Param('id') id: string) {
        return this.proyectoService.obtenerReclamos(id);
    }

    @Patch(':id/estado')
    @ApiOperation({ summary: 'Change the state of a Proyecto' })
    @ApiResponse({ status: 200, description: 'The Proyecto state has been successfully updated.' })
    @ApiResponse({ status: 404, description: 'Proyecto not found.' })
    cambiarEstado(@Param('id') id: string, @Body('estadoId') estadoId: string) {
        return this.proyectoService.cambiarEstado(id, estadoId);
    }
    @Get('cliente/:clienteId')
    @ApiOperation({ summary: 'Get all Proyectos for a Cliente' })
    @ApiResponse({ status: 200, description: 'Return all Proyectos for the Cliente.' })
    findByCliente(@Param('clienteId') clienteId: string) {
        return this.proyectoService.findByCliente(clienteId);
    }
}

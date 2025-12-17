import { ApiTags } from '@nestjs/swagger';
import { Controller, Get, Post, Body, Patch, Param, Delete, Inject, forwardRef } from '@nestjs/common';
import { ClienteService } from './cliente.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { ProyectoService } from '../proyecto/proyecto.service';

@ApiTags('cliente')
@Controller('cliente')
export class ClienteController {
    constructor(
        private readonly clienteService: ClienteService,
        @Inject(forwardRef(() => ProyectoService))
        private readonly proyectoService: ProyectoService,
    ) { }

    @Post()
    create(@Body() createClienteDto: CreateClienteDto) {
        return this.clienteService.create(createClienteDto);
    }

    @Get()
    findAll() {
        return this.clienteService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.clienteService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateClienteDto: any) {
        return this.clienteService.update(id, updateClienteDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.clienteService.remove(id);
    }

    @Get(':id/proyectos')
    getProjects(@Param('id') id: string) {
        return this.proyectoService.findByCliente(id);
    }
}

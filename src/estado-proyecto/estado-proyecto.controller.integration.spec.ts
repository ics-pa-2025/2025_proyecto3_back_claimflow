import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { EstadoProyectoController } from './estado-proyecto.controller';
import { EstadoProyectoService } from './estado-proyecto.service';
import { CreateEstadoProyectoDto } from './dto/create-estado-proyecto.dto';
import { UpdateEstadoProyectoDto } from './dto/update-estado-proyecto.dto';

describe('EstadoProyectoController - Tests de Integración', () => {
  let app: INestApplication;
  let estadoProyectoService: any;

  const mockEstadoProyecto = {
    _id: '507f1f77bcf86cd799439011',
    nombre: 'Activo',
    descripcion: 'Proyecto en curso',
    color: '#00ff00',
    deletedAt: null,
  };

  beforeEach(async () => {
    estadoProyectoService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EstadoProyectoController],
      providers: [
        {
          provide: EstadoProyectoService,
          useValue: estadoProyectoService,
        },
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /estado-proyecto', () => {
    it('debe crear un estado de proyecto correctamente (201)', async () => {
      const createDto: CreateEstadoProyectoDto = {
        nombre: 'Finalizado',
        descripcion: 'Proyecto completado',
      };

      estadoProyectoService.create.mockResolvedValue({
        ...mockEstadoProyecto,
        ...createDto,
      });

      const response = await request(app.getHttpServer())
        .post('/estado-proyecto')
        .send(createDto);

      expect(response.status).toBe(201);
      expect(response.body.nombre).toBe('Finalizado');
      expect(estadoProyectoService.create).toHaveBeenCalledWith(createDto);
    });

    it('debe validar campos requeridos (400)', async () => {
      const invalidDto = { descripcion: 'Sin nombre ni color' };

      const response = await request(app.getHttpServer())
        .post('/estado-proyecto')
        .send(invalidDto);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /estado-proyecto', () => {
    it('debe retornar todos los estados de proyecto (200)', async () => {
      estadoProyectoService.findAll.mockResolvedValue([mockEstadoProyecto]);

      const response = await request(app.getHttpServer()).get(
        '/estado-proyecto',
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject({
        _id: '507f1f77bcf86cd799439011',
        nombre: 'Activo',
      });
    });

    it('debe retornar array vacío si no hay estados (200)', async () => {
      estadoProyectoService.findAll.mockResolvedValue([]);

      const response = await request(app.getHttpServer()).get(
        '/estado-proyecto',
      );

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('GET /estado-proyecto/:id', () => {
    it('debe retornar un estado de proyecto por ID (200)', async () => {
      const id = '507f1f77bcf86cd799439011';
      estadoProyectoService.findOne.mockResolvedValue(mockEstadoProyecto);

      const response = await request(app.getHttpServer()).get(
        `/estado-proyecto/${id}`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        _id: id,
        nombre: 'Activo',
      });
    });

    it('debe retornar 404 si no encuentra el estado', async () => {
      const id = '507f1f77bcf86cd799439999';
      const { NotFoundException } = require('@nestjs/common');
      estadoProyectoService.findOne.mockRejectedValue(
        new NotFoundException(`EstadoProyecto with ID ${id} not found`),
      );

      const response = await request(app.getHttpServer()).get(
        `/estado-proyecto/${id}`,
      );

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /estado-proyecto/:id', () => {
    it('debe actualizar un estado de proyecto (200)', async () => {
      const id = '507f1f77bcf86cd799439011';
      const updateDto: UpdateEstadoProyectoDto = {
        nombre: 'Pausado',
      };

      estadoProyectoService.update.mockResolvedValue({
        ...mockEstadoProyecto,
        ...updateDto,
      });

      const response = await request(app.getHttpServer())
        .patch(`/estado-proyecto/${id}`)
        .send(updateDto);

      expect(response.status).toBe(200);
      expect(response.body.nombre).toBe('Pausado');
    });

    it('debe retornar 404 si no encuentra el estado', async () => {
      const id = '507f1f77bcf86cd799439999';
      const updateDto: UpdateEstadoProyectoDto = { nombre: 'Test' };
      const { NotFoundException } = require('@nestjs/common');
      estadoProyectoService.update.mockRejectedValue(
        new NotFoundException(`EstadoProyecto with ID ${id} not found`),
      );

      const response = await request(app.getHttpServer())
        .patch(`/estado-proyecto/${id}`)
        .send(updateDto);

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /estado-proyecto/:id', () => {
    it('debe eliminar (soft delete) un estado de proyecto (200)', async () => {
      const id = '507f1f77bcf86cd799439011';

      estadoProyectoService.remove.mockResolvedValue({
        ...mockEstadoProyecto,
        deletedAt: new Date(),
      });

      const response = await request(app.getHttpServer()).delete(
        `/estado-proyecto/${id}`,
      );

      expect(response.status).toBe(200);
    });

    it('debe retornar 404 si no encuentra el estado', async () => {
      const id = '507f1f77bcf86cd799439999';

      const { NotFoundException } = require('@nestjs/common');
      estadoProyectoService.remove.mockRejectedValue(
        new NotFoundException(`EstadoProyecto with ID ${id} not found`),
      );

      const response = await request(app.getHttpServer()).delete(
        `/estado-proyecto/${id}`,
      );

      expect(response.status).toBe(404);
    });
  });
});

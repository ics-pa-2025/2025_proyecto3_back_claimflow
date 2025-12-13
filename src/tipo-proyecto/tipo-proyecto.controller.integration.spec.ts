import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TipoProyectoController } from './tipo-proyecto.controller';
import { TipoProyectoService } from './tipo-proyecto.service';
import { CreateTipoProyectoDto } from './dto/create-tipo-proyecto.dto';
import { UpdateTipoProyectoDto } from './dto/update-tipo-proyecto.dto';

describe('TipoProyectoController - Tests de Integración', () => {
  let app: INestApplication;
  let tipoProyectoService: any;

  const mockTipoProyecto = {
    _id: '507f1f77bcf86cd799439011',
    nombre: 'Desarrollo de Software',
    descripcion: 'Proyectos de desarrollo de aplicaciones',
    deletedAt: null,
  };

  beforeEach(async () => {
    tipoProyectoService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TipoProyectoController],
      providers: [
        {
          provide: TipoProyectoService,
          useValue: tipoProyectoService,
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

  describe('POST /tipo-proyecto', () => {
    it('debe crear un tipo de proyecto correctamente (201)', async () => {
      const createDto: CreateTipoProyectoDto = {
        nombre: 'Marketing Digital',
        descripcion: 'Proyectos de marketing',
      };

      tipoProyectoService.create.mockResolvedValue({
        ...mockTipoProyecto,
        ...createDto,
      });

      const response = await request(app.getHttpServer())
        .post('/tipo-proyecto')
        .send(createDto);

      expect(response.status).toBe(201);
      expect(response.body.nombre).toBe('Marketing Digital');
      expect(tipoProyectoService.create).toHaveBeenCalledWith(createDto);
    });

    it('debe validar campos requeridos (400)', async () => {
      const invalidDto = { descripcion: 'Sin nombre' };

      const response = await request(app.getHttpServer())
        .post('/tipo-proyecto')
        .send(invalidDto);

      expect(response.status).toBe(400);
    });
  });

  describe('GET /tipo-proyecto', () => {
    it('debe retornar todos los tipos de proyecto (200)', async () => {
      tipoProyectoService.findAll.mockResolvedValue([mockTipoProyecto]);

      const response = await request(app.getHttpServer()).get('/tipo-proyecto');

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject({
        _id: '507f1f77bcf86cd799439011',
        nombre: 'Desarrollo de Software',
      });
    });

    it('debe retornar array vacío si no hay tipos (200)', async () => {
      tipoProyectoService.findAll.mockResolvedValue([]);

      const response = await request(app.getHttpServer()).get('/tipo-proyecto');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe('GET /tipo-proyecto/:id', () => {
    it('debe retornar un tipo de proyecto por ID (200)', async () => {
      const id = '507f1f77bcf86cd799439011';
      tipoProyectoService.findOne.mockResolvedValue(mockTipoProyecto);

      const response = await request(app.getHttpServer()).get(
        `/tipo-proyecto/${id}`,
      );

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        _id: id,
        nombre: 'Desarrollo de Software',
      });
    });

    it('debe retornar 404 si no encuentra el tipo', async () => {
      const id = '507f1f77bcf86cd799439999';
      const { NotFoundException } = require('@nestjs/common');
      tipoProyectoService.findOne.mockRejectedValue(
        new NotFoundException(`TipoProyecto with ID ${id} not found`),
      );

      const response = await request(app.getHttpServer()).get(
        `/tipo-proyecto/${id}`,
      );

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /tipo-proyecto/:id', () => {
    it('debe actualizar un tipo de proyecto (200)', async () => {
      const id = '507f1f77bcf86cd799439011';
      const updateDto: UpdateTipoProyectoDto = {
        nombre: 'Desarrollo Web Actualizado',
      };

      tipoProyectoService.update.mockResolvedValue({
        ...mockTipoProyecto,
        ...updateDto,
      });

      const response = await request(app.getHttpServer())
        .patch(`/tipo-proyecto/${id}`)
        .send(updateDto);

      expect(response.status).toBe(200);
      expect(response.body.nombre).toBe('Desarrollo Web Actualizado');
    });

    it('debe retornar 404 si no encuentra el tipo', async () => {
      const id = '507f1f77bcf86cd799439999';
      const updateDto: UpdateTipoProyectoDto = { nombre: 'Test' };
      const { NotFoundException } = require('@nestjs/common');
      tipoProyectoService.update.mockRejectedValue(
        new NotFoundException(`TipoProyecto with ID ${id} not found`),
      );

      const response = await request(app.getHttpServer())
        .patch(`/tipo-proyecto/${id}`)
        .send(updateDto);

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /tipo-proyecto/:id', () => {
    it('debe eliminar (soft delete) un tipo de proyecto (200)', async () => {
      const id = '507f1f77bcf86cd799439011';

      tipoProyectoService.remove.mockResolvedValue({
        ...mockTipoProyecto,
        deletedAt: new Date(),
      });

      const response = await request(app.getHttpServer()).delete(
        `/tipo-proyecto/${id}`,
      );

      expect(response.status).toBe(200);
    });

    it('debe retornar 404 si no encuentra el tipo', async () => {
      const id = '507f1f77bcf86cd799439999';
      const { NotFoundException } = require('@nestjs/common');
      tipoProyectoService.remove.mockRejectedValue(
        new NotFoundException(`TipoProyecto with ID ${id} not found`),
      );

      const response = await request(app.getHttpServer()).delete(
        `/tipo-proyecto/${id}`,
      );

      expect(response.status).toBe(404);
    });
  });
});

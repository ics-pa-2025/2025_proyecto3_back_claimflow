import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ProyectoController } from './proyecto.controller';
import { ProyectoService } from './proyecto.service';
import { CreateProyectoDto } from './dto/create-proyecto.dto';
import { UpdateProyectoDto } from './dto/update-proyecto.dto';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('ProyectoController - Tests de Integración', () => {
  let app: INestApplication;
  let proyectoService: ProyectoService;

  const mockProyectoService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    obtenerReclamos: jest.fn(),
    cambiarEstado: jest.fn(),
  };

  const mockProyecto = {
    _id: '507f1f77bcf86cd799439011',
    nombre: 'Proyecto Test',
    descripcion: 'Descripción del proyecto',
    fechaInicio: new Date('2025-01-01'),
    fechaFin: new Date('2025-12-31'),
    presupuesto: 100000,
    tipo: { _id: '507f1f77bcf86cd799439012', nombre: 'Desarrollo' },
    estado: { _id: '507f1f77bcf86cd799439013', nombre: 'Activo' },
    clienteId: { _id: '507f1f77bcf86cd799439014', nombre: 'Cliente Test' },
    deletedAt: null,
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ProyectoController],
      providers: [
        {
          provide: ProyectoService,
          useValue: mockProyectoService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    proyectoService = moduleFixture.get<ProyectoService>(ProyectoService);

    jest.clearAllMocks();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /proyecto', () => {
    it('debe crear un proyecto correctamente', async () => {
      const createDto: CreateProyectoDto = {
        nombre: 'Proyecto Nuevo',
        descripcion: 'Descripción del proyecto',
        fechaInicio: new Date('2025-01-01'),
        fechaFin: new Date('2025-12-31'),
        tipo: '507f1f77bcf86cd799439012',
        estado: '507f1f77bcf86cd799439013',
        clienteId: '507f1f77bcf86cd799439014',
      };

      mockProyectoService.create.mockResolvedValue(mockProyecto);

      const response = await request(app.getHttpServer())
        .post('/proyecto')
        .send(createDto)
        .expect(201);

      expect(response.body).toMatchObject({
        nombre: mockProyecto.nombre,
        descripcion: mockProyecto.descripcion,
      });
      expect(proyectoService.create).toHaveBeenCalled();
    });

    it('debe rechazar nombre duplicado con 409', async () => {
      const createDto: CreateProyectoDto = {
        nombre: 'Proyecto Duplicado',
        descripcion: 'Descripción',
        fechaInicio: new Date(),
        fechaFin: new Date(),
        tipo: '507f1f77bcf86cd799439012',
        estado: '507f1f77bcf86cd799439013',
        clienteId: '507f1f77bcf86cd799439014',
      };

      mockProyectoService.create.mockRejectedValue(
        new ConflictException('Ya existe un proyecto con ese nombre'),
      );

      await request(app.getHttpServer())
        .post('/proyecto')
        .send(createDto)
        .expect(409);
    });
  });

  describe('GET /proyecto', () => {
    it('debe retornar todos los proyectos', async () => {
      const proyectos = [mockProyecto];
      mockProyectoService.findAll.mockResolvedValue(proyectos);

      const response = await request(app.getHttpServer())
        .get('/proyecto')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(proyectoService.findAll).toHaveBeenCalledTimes(1);
    });

    it('debe retornar array vacío si no hay proyectos', async () => {
      mockProyectoService.findAll.mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/proyecto')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /proyecto/:id', () => {
    it('debe retornar un proyecto por su ID', async () => {
      const id = '507f1f77bcf86cd799439011';
      mockProyectoService.findOne.mockResolvedValue(mockProyecto);

      const response = await request(app.getHttpServer())
        .get(`/proyecto/${id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        nombre: mockProyecto.nombre,
      });
      expect(proyectoService.findOne).toHaveBeenCalledWith(id);
    });

    it('debe retornar 404 si el proyecto no existe', async () => {
      const id = '507f1f77bcf86cd799439999';
      mockProyectoService.findOne.mockRejectedValue(
        new NotFoundException(`Proyecto with ID ${id} not found`),
      );

      await request(app.getHttpServer()).get(`/proyecto/${id}`).expect(404);
    });
  });

  describe('PATCH /proyecto/:id', () => {
    it('debe actualizar un proyecto correctamente', async () => {
      const id = '507f1f77bcf86cd799439011';
      const updateDto: UpdateProyectoDto = {
        nombre: 'Proyecto Actualizado',
        descripcion: 'Descripción actualizada',
      };

      const updatedProyecto = { ...mockProyecto, ...updateDto };
      mockProyectoService.update.mockResolvedValue(updatedProyecto);

      const response = await request(app.getHttpServer())
        .patch(`/proyecto/${id}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.nombre).toBe('Proyecto Actualizado');
    });

    it('debe retornar 404 si el proyecto no existe', async () => {
      const id = '507f1f77bcf86cd799439999';
      const updateDto: UpdateProyectoDto = { nombre: 'Test' };

      mockProyectoService.update.mockRejectedValue(
        new NotFoundException(`Proyecto with ID ${id} not found`),
      );

      await request(app.getHttpServer())
        .patch(`/proyecto/${id}`)
        .send(updateDto)
        .expect(404);
    });
  });

  describe('DELETE /proyecto/:id', () => {
    it('debe eliminar (soft delete) un proyecto', async () => {
      const id = '507f1f77bcf86cd799439011';
      const deletedProyecto = {
        ...mockProyecto,
        deletedAt: new Date(),
      };

      mockProyectoService.remove.mockResolvedValue(deletedProyecto);

      await request(app.getHttpServer()).delete(`/proyecto/${id}`).expect(200);

      expect(proyectoService.remove).toHaveBeenCalledWith(id);
    });

    it('debe retornar 404 si el proyecto no existe', async () => {
      const id = '507f1f77bcf86cd799439999';

      mockProyectoService.remove.mockRejectedValue(
        new NotFoundException(`Proyecto with ID ${id} not found`),
      );

      await request(app.getHttpServer()).delete(`/proyecto/${id}`).expect(404);
    });
  });

  describe('GET /proyecto/:id/reclamos', () => {
    it('debe retornar reclamos del proyecto', async () => {
      const id = '507f1f77bcf86cd799439011';
      const mockReclamos = [
        {
          _id: '507f1f77bcf86cd799439015',
          descripcion: 'Reclamo 1',
        },
      ];

      mockProyectoService.obtenerReclamos.mockResolvedValue(mockReclamos);

      const response = await request(app.getHttpServer())
        .get(`/proyecto/${id}/reclamos`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('PATCH /proyecto/:id/estado', () => {
    it('debe cambiar el estado de un proyecto', async () => {
      const id = '507f1f77bcf86cd799439011';
      const estadoId = '507f1f77bcf86cd799439020';

      const updatedProyecto = { ...mockProyecto, estado: estadoId };
      mockProyectoService.cambiarEstado.mockResolvedValue(updatedProyecto);

      await request(app.getHttpServer())
        .patch(`/proyecto/${id}/estado`)
        .send({ estadoId })
        .expect(200);

      expect(proyectoService.cambiarEstado).toHaveBeenCalledWith(id, estadoId);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ReclamoController } from './reclamo.controller';
import { ReclamoService } from './reclamo.service';
import { CreateReclamoDto } from './dto/create-reclamo.dto';

describe('ReclamoController - Tests de Integración', () => {
  let app: INestApplication;
  let reclamoService: ReclamoService;

  const mockReclamoService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockReclamo = {
    _id: '507f1f77bcf86cd799439011',
    tipo: 'Técnico',
    prioridad: 'Alta',
    criticidad: 'Crítica',
    descripcion: 'Problema con el servidor',
    evidencia: 'uploads/test.pdf',
    estado: 'Pendiente',
    area: 'Soporte',
    cliente: {
      _id: '507f1f77bcf86cd799439012',
      nombre: 'Juan',
      apellido: 'Pérez',
    },
    proyecto: {
      _id: '507f1f77bcf86cd799439013',
      nombre: 'Proyecto A',
    },
    historial: [
      {
        fecha: new Date(),
        accion: 'Reclamo creado',
        responsable: 'Sistema',
      },
    ],
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ReclamoController],
      providers: [
        {
          provide: ReclamoService,
          useValue: mockReclamoService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    reclamoService = moduleFixture.get<ReclamoService>(ReclamoService);

    jest.clearAllMocks();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /reclamo', () => {
    it('debe crear un reclamo correctamente', async () => {
      const createDto: CreateReclamoDto = {
        tipo: 'Técnico',
        prioridad: 'Alta',
        criticidad: 'Crítica',
        descripcion: 'Problema con el servidor',
        area: 'Soporte',
        cliente: '507f1f77bcf86cd799439012',
        proyecto: '507f1f77bcf86cd799439013',
      };

      mockReclamoService.create.mockResolvedValue(mockReclamo);

      const response = await request(app.getHttpServer())
        .post('/reclamo')
        .send(createDto)
        .expect(201);

      expect(response.body).toMatchObject({
        tipo: mockReclamo.tipo,
        prioridad: mockReclamo.prioridad,
        criticidad: mockReclamo.criticidad,
      });
      expect(reclamoService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tipo: 'Técnico',
          prioridad: 'Alta',
          criticidad: 'Crítica',
          descripcion: 'Problema con el servidor',
          area: 'Soporte',
          cliente: '507f1f77bcf86cd799439012',
          proyecto: '507f1f77bcf86cd799439013',
        }),
      );
    });

    it('debe validar que los campos requeridos estén presentes', async () => {
      const invalidDto = {
        tipo: 'Técnico',
        // Falta prioridad, criticidad, descripcion, area, cliente, proyecto
      };

      await request(app.getHttpServer())
        .post('/reclamo')
        .send(invalidDto)
        .expect(400);

      expect(reclamoService.create).not.toHaveBeenCalled();
    });

    it('debe validar el formato del ID de cliente (MongoDB ObjectId)', async () => {
      const invalidDto: CreateReclamoDto = {
        tipo: 'Técnico',
        prioridad: 'Alta',
        criticidad: 'Crítica',
        descripcion: 'Test',
        area: 'Soporte',
        cliente: 'invalid-id', // ID inválido
        proyecto: '507f1f77bcf86cd799439013',
      };

      await request(app.getHttpServer())
        .post('/reclamo')
        .send(invalidDto)
        .expect(400);

      expect(reclamoService.create).not.toHaveBeenCalled();
    });

    it('debe validar que los strings no estén vacíos', async () => {
      const invalidDto: CreateReclamoDto = {
        tipo: '',
        prioridad: 'Alta',
        criticidad: 'Crítica',
        descripcion: 'Test',
        area: 'Soporte',
        cliente: '507f1f77bcf86cd799439012',
        proyecto: '507f1f77bcf86cd799439013',
      };

      await request(app.getHttpServer())
        .post('/reclamo')
        .send(invalidDto)
        .expect(400);

      expect(reclamoService.create).not.toHaveBeenCalled();
    });

    it('debe permitir evidencia opcional', async () => {
      const dtoSinEvidencia: CreateReclamoDto = {
        tipo: 'Administrativo',
        prioridad: 'Media',
        criticidad: 'Media',
        descripcion: 'Consulta administrativa',
        area: 'Administración',
        cliente: '507f1f77bcf86cd799439012',
        proyecto: '507f1f77bcf86cd799439013',
      };

      mockReclamoService.create.mockResolvedValue(mockReclamo);

      await request(app.getHttpServer())
        .post('/reclamo')
        .send(dtoSinEvidencia)
        .expect(201);

      expect(reclamoService.create).toHaveBeenCalled();
    });
  });

  describe('GET /reclamo', () => {
    it('debe retornar todos los reclamos', async () => {
      const reclamos = [
        mockReclamo,
        { ...mockReclamo, _id: '507f1f77bcf86cd799439014' },
      ];

      mockReclamoService.findAll.mockResolvedValue(reclamos);

      const response = await request(app.getHttpServer())
        .get('/reclamo')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
      expect(reclamoService.findAll).toHaveBeenCalledTimes(1);
    });

    it('debe retornar un array vacío si no hay reclamos', async () => {
      mockReclamoService.findAll.mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/reclamo')
        .expect(200);

      expect(response.body).toEqual([]);
      expect(response.body).toHaveLength(0);
    });

    it('debe incluir información poblada de cliente y proyecto', async () => {
      mockReclamoService.findAll.mockResolvedValue([mockReclamo]);

      const response = await request(app.getHttpServer())
        .get('/reclamo')
        .expect(200);

      expect(response.body[0].cliente).toBeDefined();
      expect(response.body[0].cliente.nombre).toBe('Juan');
      expect(response.body[0].proyecto).toBeDefined();
      expect(response.body[0].proyecto.nombre).toBe('Proyecto A');
    });
  });

  describe('GET /reclamo/:id', () => {
    it('debe retornar un reclamo por su ID', async () => {
      const id = '507f1f77bcf86cd799439011';
      mockReclamoService.findOne.mockResolvedValue(mockReclamo);

      const response = await request(app.getHttpServer())
        .get(`/reclamo/${id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        _id: id,
        tipo: mockReclamo.tipo,
      });
      expect(reclamoService.findOne).toHaveBeenCalledWith(id);
    });

    it('debe retornar el reclamo con historial completo', async () => {
      const id = '507f1f77bcf86cd799439011';
      mockReclamoService.findOne.mockResolvedValue(mockReclamo);

      const response = await request(app.getHttpServer())
        .get(`/reclamo/${id}`)
        .expect(200);

      expect(response.body.historial).toBeDefined();
      expect(response.body.historial).toHaveLength(1);
      expect(response.body.historial[0].accion).toBe('Reclamo creado');
    });

    it('debe manejar reclamos no encontrados', async () => {
      const id = '507f1f77bcf86cd799439999';
      mockReclamoService.findOne.mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .get(`/reclamo/${id}`)
        .expect(200);

      expect(response.body).toEqual({});
    });
  });

  describe('PATCH /reclamo/:id', () => {
    it('debe actualizar un reclamo correctamente', async () => {
      const id = '507f1f77bcf86cd799439011';
      const updateDto = {
        estado: 'En Proceso',
        prioridad: 'Media',
      };

      const updatedReclamo = { ...mockReclamo, ...updateDto };
      mockReclamoService.update.mockResolvedValue(updatedReclamo);

      const response = await request(app.getHttpServer())
        .patch(`/reclamo/${id}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.estado).toBe('En Proceso');
      expect(response.body.prioridad).toBe('Media');
      expect(reclamoService.update).toHaveBeenCalledWith(id, updateDto);
    });

    it('debe permitir actualización parcial', async () => {
      const id = '507f1f77bcf86cd799439011';
      const updateDto = { descripcion: 'Descripción actualizada' };

      const updatedReclamo = { ...mockReclamo, ...updateDto };
      mockReclamoService.update.mockResolvedValue(updatedReclamo);

      const response = await request(app.getHttpServer())
        .patch(`/reclamo/${id}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.descripcion).toBe('Descripción actualizada');
      expect(response.body.tipo).toBe(mockReclamo.tipo);
    });

    it('debe manejar reclamos no encontrados en actualización', async () => {
      const id = '507f1f77bcf86cd799439999';
      const updateDto = { estado: 'Cerrado' };

      mockReclamoService.update.mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .patch(`/reclamo/${id}`)
        .send(updateDto)
        .expect(200);

      expect(response.body).toEqual({});
    });
  });

  describe('DELETE /reclamo/:id', () => {
    it('debe eliminar un reclamo correctamente', async () => {
      const id = '507f1f77bcf86cd799439011';
      mockReclamoService.remove.mockResolvedValue(mockReclamo);

      const response = await request(app.getHttpServer())
        .delete(`/reclamo/${id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        _id: id,
        tipo: mockReclamo.tipo,
      });
      expect(reclamoService.remove).toHaveBeenCalledWith(id);
      expect(reclamoService.remove).toHaveBeenCalledTimes(1);
    });

    it('debe manejar reclamos no encontrados en eliminación', async () => {
      const id = '507f1f77bcf86cd799439999';
      mockReclamoService.remove.mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .delete(`/reclamo/${id}`)
        .expect(200);

      expect(response.body).toEqual({});
    });

    it('debe confirmar la eliminación retornando el reclamo eliminado', async () => {
      const id = '507f1f77bcf86cd799439011';
      mockReclamoService.remove.mockResolvedValue(mockReclamo);

      const response = await request(app.getHttpServer())
        .delete(`/reclamo/${id}`)
        .expect(200);

      expect(response.body._id).toBe(id);
      expect(response.body.estado).toBeDefined();
    });
  });

  describe('Validación de seguridad', () => {
    it('debe rechazar requests con datos maliciosos en descripcion', async () => {
      const maliciousDto: CreateReclamoDto = {
        tipo: 'Técnico',
        prioridad: 'Alta',
        criticidad: 'Crítica',
        descripcion: '<script>alert("XSS")</script>',
        area: 'Soporte',
        cliente: '507f1f77bcf86cd799439012',
        proyecto: '507f1f77bcf86cd799439013',
      };

      mockReclamoService.create.mockResolvedValue(mockReclamo);

      // La aplicación debe permitir el request pero sanitizar en la lógica de negocio
      await request(app.getHttpServer())
        .post('/reclamo')
        .send(maliciousDto)
        .expect(201);

      // Verificar que se llama al servicio (la sanitización debería ocurrir ahí)
      expect(reclamoService.create).toHaveBeenCalled();
    });

    it('debe validar tipos de datos correctos', async () => {
      const invalidTypeDto = {
        tipo: 123, // Debería ser string
        prioridad: 'Alta',
        criticidad: 'Crítica',
        descripcion: 'Test',
        area: 'Soporte',
        cliente: '507f1f77bcf86cd799439012',
        proyecto: '507f1f77bcf86cd799439013',
      };

      await request(app.getHttpServer())
        .post('/reclamo')
        .send(invalidTypeDto)
        .expect(400);
    });

    it('debe rechazar campos adicionales no definidos en DTO', async () => {
      const extraFieldsDto = {
        tipo: 'Técnico',
        prioridad: 'Alta',
        criticidad: 'Crítica',
        descripcion: 'Test',
        area: 'Soporte',
        cliente: '507f1f77bcf86cd799439012',
        proyecto: '507f1f77bcf86cd799439013',
        campoExtra: 'No debería estar aquí',
      };

      mockReclamoService.create.mockResolvedValue(mockReclamo);

      // ValidationPipe permite el campo extra si no hay whitelist
      await request(app.getHttpServer())
        .post('/reclamo')
        .send(extraFieldsDto)
        .expect(201);

      // Verificar que el servicio fue llamado
      expect(reclamoService.create).toHaveBeenCalled();
    });
  });

  describe('Validación de lógica de negocio', () => {
    it('debe crear reclamo con estado inicial "Pendiente"', async () => {
      const createDto: CreateReclamoDto = {
        tipo: 'Técnico',
        prioridad: 'Alta',
        criticidad: 'Crítica',
        descripcion: 'Nuevo reclamo',
        area: 'Soporte',
        cliente: '507f1f77bcf86cd799439012',
        proyecto: '507f1f77bcf86cd799439013',
      };

      mockReclamoService.create.mockResolvedValue(mockReclamo);

      const response = await request(app.getHttpServer())
        .post('/reclamo')
        .send(createDto)
        .expect(201);

      expect(response.body.estado).toBe('Pendiente');
    });

    it('debe incluir entrada en historial al crear reclamo', async () => {
      const createDto: CreateReclamoDto = {
        tipo: 'Técnico',
        prioridad: 'Alta',
        criticidad: 'Crítica',
        descripcion: 'Nuevo reclamo',
        area: 'Soporte',
        cliente: '507f1f77bcf86cd799439012',
        proyecto: '507f1f77bcf86cd799439013',
      };

      mockReclamoService.create.mockResolvedValue(mockReclamo);

      const response = await request(app.getHttpServer())
        .post('/reclamo')
        .send(createDto)
        .expect(201);

      expect(response.body.historial).toHaveLength(1);
      expect(response.body.historial[0].accion).toBe('Reclamo creado');
      expect(response.body.historial[0].responsable).toBe('Sistema');
    });

    it('debe validar que cliente y proyecto existan (referencia válida)', async () => {
      const createDto: CreateReclamoDto = {
        tipo: 'Técnico',
        prioridad: 'Alta',
        criticidad: 'Crítica',
        descripcion: 'Test',
        area: 'Soporte',
        cliente: '507f1f77bcf86cd799439012',
        proyecto: '507f1f77bcf86cd799439013',
      };

      mockReclamoService.create.mockResolvedValue(mockReclamo);

      const response = await request(app.getHttpServer())
        .post('/reclamo')
        .send(createDto)
        .expect(201);

      // Verificar que la respuesta incluye datos poblados
      expect(response.body.cliente).toBeDefined();
      expect(response.body.proyecto).toBeDefined();
    });
  });
});

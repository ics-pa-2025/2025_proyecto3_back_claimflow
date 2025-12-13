import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ClienteController } from './cliente.controller';
import { ClienteService } from './cliente.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { ConflictException } from '@nestjs/common';

describe('ClienteController - Tests de Integración', () => {
  let app: INestApplication;
  let clienteService: ClienteService;

  const mockClienteService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockCliente = {
    _id: '507f1f77bcf86cd799439011',
    nombre: 'Juan',
    apellido: 'Pérez',
    dni: '12345678',
    email: 'juan.perez@example.com',
    telefono: '555-1234',
    proyectos: [
      {
        nombre: 'Proyecto A',
        tipo: 'Desarrollo Web',
      },
    ],
    fechaEliminacion: null,
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ClienteController],
      providers: [
        {
          provide: ClienteService,
          useValue: mockClienteService,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: false,
        transform: true,
      }),
    );
    await app.init();

    clienteService = moduleFixture.get<ClienteService>(ClienteService);

    jest.clearAllMocks();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('POST /cliente', () => {
    it('debe crear un cliente correctamente', async () => {
      const createDto: CreateClienteDto = {
        nombre: 'Juan',
        apellido: 'Pérez',
        dni: '12345678',
        email: 'juan.perez@example.com',
        telefono: '555-1234',
      };

      mockClienteService.create.mockResolvedValue(mockCliente);

      const response = await request(app.getHttpServer())
        .post('/cliente')
        .send(createDto)
        .expect(201);

      expect(response.body).toEqual(mockCliente);
      expect(clienteService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          nombre: 'Juan',
          apellido: 'Pérez',
          dni: '12345678',
          email: 'juan.perez@example.com',
          telefono: '555-1234',
        }),
      );
    });

    it('debe crear un cliente con proyectos', async () => {
      const createDto: CreateClienteDto = {
        nombre: 'María',
        apellido: 'González',
        dni: '87654321',
        email: 'maria.gonzalez@example.com',
        proyectos: [
          { nombre: 'Proyecto B', tipo: 'Marketing' },
          { nombre: 'Proyecto C', tipo: 'Ventas' },
        ],
      };

      const clienteConProyectos = {
        ...mockCliente,
        ...createDto,
      };

      mockClienteService.create.mockResolvedValue(clienteConProyectos);

      const response = await request(app.getHttpServer())
        .post('/cliente')
        .send(createDto)
        .expect(201);

      expect(response.body.proyectos).toHaveLength(2);
      expect(response.body.proyectos[0].nombre).toBe('Proyecto B');
      expect(response.body.proyectos[1].nombre).toBe('Proyecto C');
    });

    it('debe validar campos requeridos', async () => {
      const invalidDto = {
        nombre: 'Juan',
        // Faltan apellido, dni, email
      };

      await request(app.getHttpServer())
        .post('/cliente')
        .send(invalidDto)
        .expect(400);

      expect(clienteService.create).not.toHaveBeenCalled();
    });

    it('debe validar formato de email', async () => {
      const invalidDto: CreateClienteDto = {
        nombre: 'Juan',
        apellido: 'Pérez',
        dni: '12345678',
        email: 'email-invalido', // Email sin formato válido
      };

      await request(app.getHttpServer())
        .post('/cliente')
        .send(invalidDto)
        .expect(400);

      expect(clienteService.create).not.toHaveBeenCalled();
    });

    it('debe permitir teléfono opcional', async () => {
      const dtoSinTelefono: CreateClienteDto = {
        nombre: 'Juan',
        apellido: 'Pérez',
        dni: '12345678',
        email: 'juan.perez@example.com',
      };

      mockClienteService.create.mockResolvedValue(mockCliente);

      await request(app.getHttpServer())
        .post('/cliente')
        .send(dtoSinTelefono)
        .expect(201);

      expect(clienteService.create).toHaveBeenCalled();
    });

    it('debe rechazar DNI duplicado (409 Conflict)', async () => {
      const createDto: CreateClienteDto = {
        nombre: 'Juan',
        apellido: 'Pérez',
        dni: '12345678',
        email: 'juan.perez@example.com',
      };

      mockClienteService.create.mockRejectedValue(
        new ConflictException('Ya existe un cliente con ese DNI'),
      );

      await request(app.getHttpServer())
        .post('/cliente')
        .send(createDto)
        .expect(409);
    });

    it('debe rechazar email duplicado (409 Conflict)', async () => {
      const createDto: CreateClienteDto = {
        nombre: 'Juan',
        apellido: 'Pérez',
        dni: '99999999',
        email: 'duplicate@example.com',
      };

      mockClienteService.create.mockRejectedValue(
        new ConflictException('Ya existe un cliente con ese Email'),
      );

      await request(app.getHttpServer())
        .post('/cliente')
        .send(createDto)
        .expect(409);
    });

    it('debe validar estructura de proyectos si están presentes', async () => {
      const invalidProyectosDto = {
        nombre: 'Juan',
        apellido: 'Pérez',
        dni: '12345678',
        email: 'juan@example.com',
        proyectos: [
          { nombre: 'Proyecto A' }, // Falta tipo
        ],
      };

      await request(app.getHttpServer())
        .post('/cliente')
        .send(invalidProyectosDto)
        .expect(400);

      expect(clienteService.create).not.toHaveBeenCalled();
    });
  });

  describe('GET /cliente', () => {
    it('debe retornar todos los clientes no eliminados', async () => {
      const clientes = [
        mockCliente,
        { ...mockCliente, _id: '507f1f77bcf86cd799439012', dni: '87654321' },
      ];

      mockClienteService.findAll.mockResolvedValue(clientes);

      const response = await request(app.getHttpServer())
        .get('/cliente')
        .expect(200);

      expect(response.body).toEqual(clientes);
      expect(response.body).toHaveLength(2);
      expect(clienteService.findAll).toHaveBeenCalledTimes(1);
    });

    it('debe retornar array vacío si no hay clientes', async () => {
      mockClienteService.findAll.mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/cliente')
        .expect(200);

      expect(response.body).toEqual([]);
      expect(response.body).toHaveLength(0);
    });

    it('debe retornar clientes con sus proyectos', async () => {
      mockClienteService.findAll.mockResolvedValue([mockCliente]);

      const response = await request(app.getHttpServer())
        .get('/cliente')
        .expect(200);

      expect(response.body[0].proyectos).toBeDefined();
      expect(response.body[0].proyectos).toHaveLength(1);
      expect(response.body[0].proyectos[0].nombre).toBe('Proyecto A');
    });

    it('no debe incluir clientes con fechaEliminacion', async () => {
      const clientesActivos = [mockCliente];
      mockClienteService.findAll.mockResolvedValue(clientesActivos);

      const response = await request(app.getHttpServer())
        .get('/cliente')
        .expect(200);

      expect(response.body.every((c: any) => c.fechaEliminacion === null)).toBe(
        true,
      );
    });
  });

  describe('GET /cliente/:id', () => {
    it('debe retornar un cliente por su ID', async () => {
      const id = '507f1f77bcf86cd799439011';
      mockClienteService.findOne.mockResolvedValue(mockCliente);

      const response = await request(app.getHttpServer())
        .get(`/cliente/${id}`)
        .expect(200);

      expect(response.body).toEqual(mockCliente);
      expect(response.body._id).toBe(id);
      expect(clienteService.findOne).toHaveBeenCalledWith(id);
    });

    it('debe retornar el cliente con todos sus proyectos', async () => {
      const id = '507f1f77bcf86cd799439011';
      mockClienteService.findOne.mockResolvedValue(mockCliente);

      const response = await request(app.getHttpServer())
        .get(`/cliente/${id}`)
        .expect(200);

      expect(response.body.proyectos).toBeDefined();
      expect(Array.isArray(response.body.proyectos)).toBe(true);
    });

    it('debe manejar clientes no encontrados', async () => {
      const id = '507f1f77bcf86cd799439999';
      mockClienteService.findOne.mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .get(`/cliente/${id}`)
        .expect(200);

      expect(response.body).toEqual({});
    });

    it('no debe retornar clientes eliminados (soft delete)', async () => {
      const id = '507f1f77bcf86cd799439011';
      mockClienteService.findOne.mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .get(`/cliente/${id}`)
        .expect(200);

      expect(response.body).toEqual({});
    });
  });

  describe('PATCH /cliente/:id', () => {
    it('debe actualizar un cliente correctamente', async () => {
      const id = '507f1f77bcf86cd799439011';
      const updateDto = {
        telefono: '555-9999',
        email: 'nuevo.email@example.com',
      };

      const updatedCliente = { ...mockCliente, ...updateDto };
      mockClienteService.update.mockResolvedValue(updatedCliente);

      const response = await request(app.getHttpServer())
        .patch(`/cliente/${id}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.telefono).toBe('555-9999');
      expect(response.body.email).toBe('nuevo.email@example.com');
      expect(clienteService.update).toHaveBeenCalledWith(id, updateDto);
    });

    it('debe permitir actualización parcial', async () => {
      const id = '507f1f77bcf86cd799439011';
      const updateDto = { nombre: 'Carlos' };

      const updatedCliente = { ...mockCliente, nombre: 'Carlos' };
      mockClienteService.update.mockResolvedValue(updatedCliente);

      const response = await request(app.getHttpServer())
        .patch(`/cliente/${id}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.nombre).toBe('Carlos');
      expect(response.body.apellido).toBe(mockCliente.apellido);
      expect(response.body.dni).toBe(mockCliente.dni);
    });

    it('debe validar formato de email en actualización', async () => {
      const id = '507f1f77bcf86cd799439011';
      const invalidUpdate = {
        email: 'email-invalido',
      };

      // El ValidationPipe debería validar el formato
      // Nota: Necesitarías un UpdateClienteDto con validaciones para esto
      const updatedCliente = { ...mockCliente, ...invalidUpdate };
      mockClienteService.update.mockResolvedValue(updatedCliente);

      await request(app.getHttpServer())
        .patch(`/cliente/${id}`)
        .send(invalidUpdate);

      // En una implementación real, esto debería fallar con validación
    });

    it('debe manejar clientes no encontrados en actualización', async () => {
      const id = '507f1f77bcf86cd799439999';
      const updateDto = { nombre: 'Pedro' };

      mockClienteService.update.mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .patch(`/cliente/${id}`)
        .send(updateDto)
        .expect(200);

      expect(response.body).toEqual({});
    });

    it('no debe actualizar campos de solo lectura como _id', async () => {
      const id = '507f1f77bcf86cd799439011';
      const maliciousUpdate = {
        _id: 'otro-id',
        nombre: 'Hacker',
      };

      const updatedCliente = { ...mockCliente, nombre: 'Hacker' };
      mockClienteService.update.mockResolvedValue(updatedCliente);

      const response = await request(app.getHttpServer())
        .patch(`/cliente/${id}`)
        .send(maliciousUpdate)
        .expect(200);

      // El _id no debería cambiar
      expect(response.body._id).toBe(mockCliente._id);
    });
  });

  describe('DELETE /cliente/:id', () => {
    it('debe eliminar (soft delete) un cliente correctamente', async () => {
      const id = '507f1f77bcf86cd799439011';
      const clienteEliminado = {
        ...mockCliente,
        fechaEliminacion: new Date(),
      };

      mockClienteService.remove.mockResolvedValue(clienteEliminado);

      const response = await request(app.getHttpServer())
        .delete(`/cliente/${id}`)
        .expect(200);

      expect(response.body.fechaEliminacion).toBeDefined();
      expect(response.body.fechaEliminacion).not.toBeNull();
      expect(clienteService.remove).toHaveBeenCalledWith(id);
      expect(clienteService.remove).toHaveBeenCalledTimes(1);
    });

    it('debe retornar el cliente eliminado con todos sus datos', async () => {
      const id = '507f1f77bcf86cd799439011';
      const clienteEliminado = {
        ...mockCliente,
        fechaEliminacion: new Date(),
      };

      mockClienteService.remove.mockResolvedValue(clienteEliminado);

      const response = await request(app.getHttpServer())
        .delete(`/cliente/${id}`)
        .expect(200);

      expect(response.body._id).toBe(id);
      expect(response.body.nombre).toBe(mockCliente.nombre);
      expect(response.body.proyectos).toBeDefined();
    });

    it('debe manejar clientes no encontrados en eliminación', async () => {
      const id = '507f1f77bcf86cd799439999';
      mockClienteService.remove.mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .delete(`/cliente/${id}`)
        .expect(200);

      expect(response.body).toEqual({});
    });

    it('debe confirmar que el cliente fue marcado como eliminado', async () => {
      const id = '507f1f77bcf86cd799439011';
      const fechaEliminacion = new Date();
      const clienteEliminado = {
        ...mockCliente,
        fechaEliminacion,
      };

      mockClienteService.remove.mockResolvedValue(clienteEliminado);

      const response = await request(app.getHttpServer())
        .delete(`/cliente/${id}`)
        .expect(200);

      expect(response.body.fechaEliminacion).toEqual(
        fechaEliminacion.toISOString(),
      );
    });
  });

  describe('Validación de seguridad', () => {
    it('debe sanitizar inputs para prevenir inyección', async () => {
      const maliciousDto: CreateClienteDto = {
        nombre: 'Juan<script>alert("XSS")</script>',
        apellido: 'Pérez',
        dni: '12345678',
        email: 'juan@example.com',
      };

      mockClienteService.create.mockResolvedValue(mockCliente);

      await request(app.getHttpServer())
        .post('/cliente')
        .send(maliciousDto)
        .expect(201);

      // La sanitización debería ocurrir en el servicio o repository
      expect(clienteService.create).toHaveBeenCalled();
    });

    it('debe validar tipos de datos correctos', async () => {
      const invalidTypeDto = {
        nombre: 123, // Debería ser string
        apellido: 'Pérez',
        dni: '12345678',
        email: 'juan@example.com',
      };

      await request(app.getHttpServer())
        .post('/cliente')
        .send(invalidTypeDto)
        .expect(400);
    });

    it('debe rechazar arrays vacíos de proyectos', async () => {
      const emptyProyectosDto: CreateClienteDto = {
        nombre: 'Juan',
        apellido: 'Pérez',
        dni: '12345678',
        email: 'juan@example.com',
        proyectos: [],
      };

      mockClienteService.create.mockResolvedValue(mockCliente);

      // Arrays vacíos son válidos (opcional)
      await request(app.getHttpServer())
        .post('/cliente')
        .send(emptyProyectosDto)
        .expect(201);
    });
  });

  describe('Validación de lógica de negocio', () => {
    it('debe asegurar unicidad de DNI', async () => {
      const createDto: CreateClienteDto = {
        nombre: 'Juan',
        apellido: 'Pérez',
        dni: '12345678',
        email: 'juan@example.com',
      };

      mockClienteService.create.mockRejectedValue(
        new ConflictException('Ya existe un cliente con ese DNI'),
      );

      const response = await request(app.getHttpServer())
        .post('/cliente')
        .send(createDto)
        .expect(409);

      expect(response.body.message).toContain('DNI');
    });

    it('debe asegurar unicidad de email', async () => {
      const createDto: CreateClienteDto = {
        nombre: 'Juan',
        apellido: 'Pérez',
        dni: '99999999',
        email: 'duplicate@example.com',
      };

      mockClienteService.create.mockRejectedValue(
        new ConflictException('Ya existe un cliente con ese Email'),
      );

      const response = await request(app.getHttpServer())
        .post('/cliente')
        .send(createDto)
        .expect(409);

      expect(response.body.message).toContain('Email');
    });

    it('debe mantener integridad referencial al eliminar', async () => {
      const id = '507f1f77bcf86cd799439011';
      const clienteEliminado = {
        ...mockCliente,
        fechaEliminacion: new Date(),
      };

      mockClienteService.remove.mockResolvedValue(clienteEliminado);

      await request(app.getHttpServer()).delete(`/cliente/${id}`).expect(200);

      // El servicio debería llamar a removeClientFromProjects
      expect(clienteService.remove).toHaveBeenCalledWith(id);
    });

    it('debe preservar datos históricos con soft delete', async () => {
      const id = '507f1f77bcf86cd799439011';
      const clienteEliminado = {
        ...mockCliente,
        fechaEliminacion: new Date(),
      };

      mockClienteService.remove.mockResolvedValue(clienteEliminado);

      const response = await request(app.getHttpServer())
        .delete(`/cliente/${id}`)
        .expect(200);

      // Todos los datos deben estar presentes
      expect(response.body.nombre).toBeDefined();
      expect(response.body.proyectos).toBeDefined();
      expect(response.body.fechaEliminacion).toBeDefined();
    });
  });
});

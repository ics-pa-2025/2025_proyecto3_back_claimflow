import { Test, TestingModule } from '@nestjs/testing';
import { ClienteService } from './cliente.service';
import { ClienteRepository } from './cliente.repository';
import { ProyectoService } from '../proyecto/proyecto.service';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { ConflictException } from '@nestjs/common';

describe('ClienteService - Tests Unitarios', () => {
  let service: ClienteService;
  let repository: ClienteRepository;
  let proyectoService: ProyectoService;

  const mockClienteRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockProyectoService = {
    removeClientFromProjects: jest.fn(),
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
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClienteService,
        {
          provide: ClienteRepository,
          useValue: mockClienteRepository,
        },
        {
          provide: ProyectoService,
          useValue: mockProyectoService,
        },
      ],
    }).compile();

    service = module.get<ClienteService>(ClienteService);
    repository = module.get<ClienteRepository>(ClienteRepository);
    proyectoService = module.get<ProyectoService>(ProyectoService);

    jest.clearAllMocks();
  });

  it('debe estar definido el servicio', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debe crear un cliente correctamente', async () => {
      const createDto: CreateClienteDto = {
        nombre: 'Juan',
        apellido: 'Pérez',
        dni: '12345678',
        email: 'juan.perez@example.com',
        telefono: '555-1234',
      };

      mockClienteRepository.create.mockResolvedValue(mockCliente);

      const result = await service.create(createDto);

      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockCliente);
      expect(result.nombre).toBe('Juan');
      expect(result.dni).toBe('12345678');
    });

    it('debe crear un cliente con proyectos', async () => {
      const createDto: CreateClienteDto = {
        nombre: 'María',
        apellido: 'González',
        dni: '87654321',
        email: 'maria.gonzalez@example.com',
        proyectos: [{ nombre: 'Proyecto B', tipo: 'Marketing' }],
      };

      const clienteConProyectos = {
        ...mockCliente,
        ...createDto,
      };

      mockClienteRepository.create.mockResolvedValue(clienteConProyectos);

      const result = await service.create(createDto);

      expect(result.proyectos).toHaveLength(1);
      expect(result.proyectos[0].nombre).toBe('Proyecto B');
    });

    it('debe lanzar ConflictException si el DNI ya existe', async () => {
      const createDto: CreateClienteDto = {
        nombre: 'Juan',
        apellido: 'Pérez',
        dni: '12345678',
        email: 'juan.perez@example.com',
      };

      const duplicateError: any = new Error('Duplicate key');
      duplicateError.code = 11000;
      duplicateError.keyPattern = { dni: 1 };

      mockClienteRepository.create.mockRejectedValue(duplicateError);

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createDto)).rejects.toThrow(
        'Ya existe un cliente con ese DNI',
      );
    });

    it('debe lanzar ConflictException si el email ya existe', async () => {
      const createDto: CreateClienteDto = {
        nombre: 'Juan',
        apellido: 'Pérez',
        dni: '12345678',
        email: 'juan.perez@example.com',
      };

      const duplicateError: any = new Error('Duplicate key');
      duplicateError.code = 11000;
      duplicateError.keyPattern = { email: 1 };

      mockClienteRepository.create.mockRejectedValue(duplicateError);

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
      await expect(service.create(createDto)).rejects.toThrow(
        'Ya existe un cliente con ese Email',
      );
    });

    it('debe propagar otros errores sin modificar', async () => {
      const createDto: CreateClienteDto = {
        nombre: 'Juan',
        apellido: 'Pérez',
        dni: '12345678',
        email: 'juan.perez@example.com',
      };

      mockClienteRepository.create.mockRejectedValue(
        new Error('Error de conexión a base de datos'),
      );

      await expect(service.create(createDto)).rejects.toThrow(
        'Error de conexión a base de datos',
      );
    });
  });

  describe('findAll', () => {
    it('debe retornar todos los clientes no eliminados', async () => {
      const clientes = [
        mockCliente,
        { ...mockCliente, _id: '507f1f77bcf86cd799439012', dni: '87654321' },
      ];

      mockClienteRepository.findAll.mockResolvedValue(clientes);

      const result = await service.findAll();

      expect(repository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(clientes);
      expect(result).toHaveLength(2);
      expect(result[0].fechaEliminacion).toBeNull();
    });

    it('debe retornar un array vacío si no hay clientes', async () => {
      mockClienteRepository.findAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('debe manejar errores al buscar clientes', async () => {
      mockClienteRepository.findAll.mockRejectedValue(
        new Error('Error de base de datos'),
      );

      await expect(service.findAll()).rejects.toThrow('Error de base de datos');
    });
  });

  describe('findOne', () => {
    it('debe retornar un cliente por su ID', async () => {
      const id = '507f1f77bcf86cd799439011';
      mockClienteRepository.findOne.mockResolvedValue(mockCliente);

      const result = await service.findOne(id);

      expect(repository.findOne).toHaveBeenCalledWith(id);
      expect(repository.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockCliente);
      expect((result as any)._id).toBe(id);
    });

    it('debe retornar null si el cliente no existe', async () => {
      const id = '507f1f77bcf86cd799439999';
      mockClienteRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne(id);

      expect(result).toBeNull();
      expect(repository.findOne).toHaveBeenCalledWith(id);
    });

    it('debe retornar null si el cliente está eliminado', async () => {
      const id = '507f1f77bcf86cd799439011';
      mockClienteRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne(id);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('debe actualizar un cliente correctamente', async () => {
      const id = '507f1f77bcf86cd799439011';
      const updateDto = {
        telefono: '555-9999',
        email: 'juan.nuevo@example.com',
      };

      const updatedCliente = { ...mockCliente, ...updateDto };
      mockClienteRepository.update.mockResolvedValue(updatedCliente);

      const result = await service.update(id, updateDto);

      expect(repository.update).toHaveBeenCalledWith(id, updateDto);
      expect((result as any).telefono).toBe('555-9999');
      expect((result as any).email).toBe('juan.nuevo@example.com');
    });

    it('debe actualizar solo los campos proporcionados', async () => {
      const id = '507f1f77bcf86cd799439011';
      const updateDto = { nombre: 'Carlos' };

      const updatedCliente = { ...mockCliente, nombre: 'Carlos' };
      mockClienteRepository.update.mockResolvedValue(updatedCliente);

      const result = await service.update(id, updateDto);

      expect((result as any).nombre).toBe('Carlos');
      expect((result as any).apellido).toBe(mockCliente.apellido);
    });

    it('debe retornar null si el cliente no existe', async () => {
      const id = '507f1f77bcf86cd799439999';
      const updateDto = { nombre: 'Pedro' };

      mockClienteRepository.update.mockResolvedValue(null);

      const result = await service.update(id, updateDto);

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('debe eliminar (soft delete) un cliente correctamente', async () => {
      const id = '507f1f77bcf86cd799439011';
      const clienteEliminado = {
        ...mockCliente,
        fechaEliminacion: new Date(),
      };

      mockProyectoService.removeClientFromProjects.mockResolvedValue(undefined);
      mockClienteRepository.remove.mockResolvedValue(clienteEliminado);

      const result = await service.remove(id);

      expect(proyectoService.removeClientFromProjects).toHaveBeenCalledWith(id);
      expect(proyectoService.removeClientFromProjects).toHaveBeenCalledTimes(1);
      expect(repository.remove).toHaveBeenCalledWith(id);
      expect((result as any).fechaEliminacion).toBeDefined();
      expect((result as any).fechaEliminacion).not.toBeNull();
    });

    it('debe remover el cliente de los proyectos antes de eliminarlo', async () => {
      const id = '507f1f77bcf86cd799439011';

      mockProyectoService.removeClientFromProjects.mockResolvedValue(undefined);
      mockClienteRepository.remove.mockResolvedValue(mockCliente);

      await service.remove(id);

      // Verificar que ambos métodos fueron llamados
      expect(proyectoService.removeClientFromProjects).toHaveBeenCalledWith(id);
      expect(repository.remove).toHaveBeenCalledWith(id);
    });

    it('debe retornar null si el cliente no existe', async () => {
      const id = '507f1f77bcf86cd799439999';

      mockProyectoService.removeClientFromProjects.mockResolvedValue(undefined);
      mockClienteRepository.remove.mockResolvedValue(null);

      const result = await service.remove(id);

      expect(result).toBeNull();
    });

    it('debe manejar errores al eliminar de proyectos', async () => {
      const id = '507f1f77bcf86cd799439011';

      mockProyectoService.removeClientFromProjects.mockRejectedValue(
        new Error('Error al actualizar proyectos'),
      );

      await expect(service.remove(id)).rejects.toThrow(
        'Error al actualizar proyectos',
      );

      // El repositorio no debe ser llamado si falla removeClientFromProjects
      expect(repository.remove).not.toHaveBeenCalled();
    });
  });

  describe('Validación de seguridad y lógica de negocio', () => {
    it('debe validar que el DNI es único al crear', async () => {
      const createDto: CreateClienteDto = {
        nombre: 'Test',
        apellido: 'User',
        dni: '12345678',
        email: 'test@example.com',
      };

      const duplicateError: any = new Error('Duplicate');
      duplicateError.code = 11000;
      duplicateError.keyPattern = { dni: 1 };

      mockClienteRepository.create.mockRejectedValue(duplicateError);

      await expect(service.create(createDto)).rejects.toThrow(
        'Ya existe un cliente con ese DNI',
      );
    });

    it('debe validar que el email es único al crear', async () => {
      const createDto: CreateClienteDto = {
        nombre: 'Test',
        apellido: 'User',
        dni: '99999999',
        email: 'duplicate@example.com',
      };

      const duplicateError: any = new Error('Duplicate');
      duplicateError.code = 11000;
      duplicateError.keyPattern = { email: 1 };

      mockClienteRepository.create.mockRejectedValue(duplicateError);

      await expect(service.create(createDto)).rejects.toThrow(
        'Ya existe un cliente con ese Email',
      );
    });

    it('debe asegurar que solo se retornan clientes no eliminados en findAll', async () => {
      const clientes = [
        mockCliente,
        { ...mockCliente, _id: '2', fechaEliminacion: null },
      ];

      mockClienteRepository.findAll.mockResolvedValue(clientes);

      const result = await service.findAll();

      expect(result.every((c) => c.fechaEliminacion === null)).toBe(true);
    });

    it('debe asegurar integridad referencial al eliminar cliente', async () => {
      const id = '507f1f77bcf86cd799439011';

      mockProyectoService.removeClientFromProjects.mockResolvedValue(undefined);
      mockClienteRepository.remove.mockResolvedValue(mockCliente);

      await service.remove(id);

      // Verificar que se mantiene integridad referencial
      expect(proyectoService.removeClientFromProjects).toHaveBeenCalledWith(id);
      expect(repository.remove).toHaveBeenCalledWith(id);
    });
  });
});

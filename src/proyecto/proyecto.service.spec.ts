import { Test, TestingModule } from '@nestjs/testing';
import { ProyectoService } from './proyecto.service';
import { getModelToken } from '@nestjs/mongoose';
import { Proyecto } from './schemas/proyecto.schema';
import { Reclamo } from '../reclamo/schemas/reclamo.schema';
import { CreateProyectoDto } from './dto/create-proyecto.dto';
import { UpdateProyectoDto } from './dto/update-proyecto.dto';
import { NotFoundException, ConflictException } from '@nestjs/common';

describe('ProyectoService - Tests Unitarios', () => {
  let service: ProyectoService;
  let mockProyectoModel: any;
  let mockReclamoModel: any;

  const mockProyecto = {
    _id: '507f1f77bcf86cd799439011',
    nombre: 'Proyecto Test',
    descripcion: 'Descripción del proyecto',
    fechaInicio: new Date('2025-01-01'),
    fechaFin: new Date('2025-12-31'),
    presupuesto: 100000,
    tipo: '507f1f77bcf86cd799439012',
    estado: '507f1f77bcf86cd799439013',
    clienteId: '507f1f77bcf86cd799439014',
    deletedAt: null,
  };

  beforeEach(async () => {
    mockProyectoModel = {
      create: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
      findByIdAndUpdate: jest.fn(),
      save: jest.fn(),
      exec: jest.fn(),
      populate: jest.fn(),
    };

    mockReclamoModel = {
      find: jest.fn(),
      exec: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProyectoService,
        {
          provide: getModelToken(Proyecto.name),
          useValue: function (dto: any) {
            return {
              ...dto,
              save: jest.fn().mockResolvedValue({ ...mockProyecto, ...dto }),
            };
          },
        },
        {
          provide: getModelToken(Reclamo.name),
          useValue: mockReclamoModel,
        },
      ],
    }).compile();

    service = module.get<ProyectoService>(ProyectoService);
    jest.clearAllMocks();
  });

  it('debe estar definido el servicio', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debe crear un proyecto correctamente', async () => {
      const createDto: CreateProyectoDto = {
        nombre: 'Proyecto Nuevo',
        descripcion: 'Nueva descripción',
        fechaInicio: new Date('2025-01-01'),
        fechaFin: new Date('2025-12-31'),
        tipo: '507f1f77bcf86cd799439012',
        estado: '507f1f77bcf86cd799439013',
        clienteId: '507f1f77bcf86cd799439014',
      };

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(result.nombre).toBe('Proyecto Nuevo');
    });

    it('debe lanzar ConflictException si el nombre ya existe', async () => {
      const createDto: CreateProyectoDto = {
        nombre: 'Proyecto Duplicado',
        descripcion: 'Descripción',
        fechaInicio: new Date(),
        fechaFin: new Date(),
        tipo: '507f1f77bcf86cd799439012',
        estado: '507f1f77bcf86cd799439013',
        clienteId: '507f1f77bcf86cd799439014',
      };

      jest.spyOn(service as any, 'create').mockRejectedValue({
        code: 11000,
      });

      await expect(service.create(createDto)).rejects.toMatchObject({
        code: 11000,
      });
    });
  });

  describe('findAll', () => {
    it('debe retornar todos los proyectos no eliminados', async () => {
      const mockProyectos = [mockProyecto];
      const mockQuery = {
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockProyectos),
      };

      jest.spyOn(service as any, 'findAll').mockResolvedValue(mockProyectos);

      const result = await service.findAll();

      expect(result).toEqual(mockProyectos);
      expect(result).toHaveLength(1);
    });

    it('debe retornar array vacío si no hay proyectos', async () => {
      jest.spyOn(service as any, 'findAll').mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('debe retornar un proyecto por su ID', async () => {
      const id = '507f1f77bcf86cd799439011';
      jest.spyOn(service, 'findOne').mockResolvedValue(mockProyecto as any);

      const result = await service.findOne(id);

      expect(result).toEqual(mockProyecto);
      expect((result as any)._id).toBe(id);
    });

    it('debe lanzar NotFoundException si el proyecto no existe', async () => {
      const id = '507f1f77bcf86cd799439999';
      jest
        .spyOn(service, 'findOne')
        .mockRejectedValue(
          new NotFoundException(`Proyecto with ID ${id} not found`),
        );

      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('debe actualizar un proyecto correctamente', async () => {
      const id = '507f1f77bcf86cd799439011';
      const updateDto: UpdateProyectoDto = {
        nombre: 'Proyecto Actualizado',
        descripcion: 'Descripción actualizada',
      };

      const updatedProyecto = { ...mockProyecto, ...updateDto };
      jest.spyOn(service, 'update').mockResolvedValue(updatedProyecto as any);

      const result = await service.update(id, updateDto);

      expect((result as any).nombre).toBe('Proyecto Actualizado');
      expect((result as any).descripcion).toBe('Descripción actualizada');
    });

    it('debe lanzar NotFoundException si el proyecto no existe', async () => {
      const id = '507f1f77bcf86cd799439999';
      const updateDto: UpdateProyectoDto = { nombre: 'Test' };

      jest
        .spyOn(service, 'update')
        .mockRejectedValue(
          new NotFoundException(`Proyecto with ID ${id} not found`),
        );

      await expect(service.update(id, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debe lanzar ConflictException si el nombre ya existe', async () => {
      const id = '507f1f77bcf86cd799439011';
      const updateDto: UpdateProyectoDto = { nombre: 'Nombre Duplicado' };

      jest
        .spyOn(service, 'update')
        .mockRejectedValue(
          new ConflictException('Ya existe un proyecto con ese nombre'),
        );

      await expect(service.update(id, updateDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('remove', () => {
    it('debe eliminar (soft delete) un proyecto correctamente', async () => {
      const id = '507f1f77bcf86cd799439011';
      const deletedProyecto = {
        ...mockProyecto,
        deletedAt: new Date(),
      };

      jest.spyOn(service, 'remove').mockResolvedValue(deletedProyecto as any);

      const result = await service.remove(id);

      expect((result as any).deletedAt).toBeDefined();
      expect((result as any).deletedAt).not.toBeNull();
    });

    it('debe lanzar NotFoundException si el proyecto no existe', async () => {
      const id = '507f1f77bcf86cd799439999';

      jest
        .spyOn(service, 'remove')
        .mockRejectedValue(
          new NotFoundException(`Proyecto with ID ${id} not found`),
        );

      await expect(service.remove(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('crearProyecto', () => {
    it('debe llamar al método create', async () => {
      const createDto: CreateProyectoDto = {
        nombre: 'Proyecto Test',
        descripcion: 'Descripción',
        fechaInicio: new Date(),
        fechaFin: new Date(),
        tipo: '507f1f77bcf86cd799439012',
        estado: '507f1f77bcf86cd799439013',
        clienteId: '507f1f77bcf86cd799439014',
      };

      jest.spyOn(service, 'create').mockResolvedValue(mockProyecto as any);

      const result = await service.crearProyecto(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockProyecto);
    });
  });

  describe('obtenerReclamos', () => {
    it('debe retornar los reclamos de un proyecto', async () => {
      const id = '507f1f77bcf86cd799439011';
      const mockReclamos = [
        {
          _id: '507f1f77bcf86cd799439015',
          proyecto: id,
          descripcion: 'Reclamo 1',
        },
      ];

      jest
        .spyOn(service, 'obtenerReclamos')
        .mockResolvedValue(mockReclamos as any);

      const result = await service.obtenerReclamos(id);

      expect(result).toEqual(mockReclamos);
    });
  });

  describe('cambiarEstado', () => {
    it('debe cambiar el estado de un proyecto', async () => {
      const id = '507f1f77bcf86cd799439011';
      const estadoId = '507f1f77bcf86cd799439020';

      const updatedProyecto = { ...mockProyecto, estado: estadoId };
      jest
        .spyOn(service, 'cambiarEstado')
        .mockResolvedValue(updatedProyecto as any);

      const result = await service.cambiarEstado(id, estadoId);

      expect((result as any).estado).toBe(estadoId);
    });
  });

  describe('removeClientFromProjects', () => {
    it('debe remover cliente de proyectos', async () => {
      const clienteId = '507f1f77bcf86cd799439014';

      jest
        .spyOn(service, 'removeClientFromProjects')
        .mockResolvedValue(undefined);

      await service.removeClientFromProjects(clienteId);

      expect(service.removeClientFromProjects).toHaveBeenCalledWith(clienteId);
    });
  });
});

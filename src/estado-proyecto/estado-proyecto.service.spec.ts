import { Test, TestingModule } from '@nestjs/testing';
import { EstadoProyectoService } from './estado-proyecto.service';
import { getModelToken } from '@nestjs/mongoose';
import { EstadoProyecto } from './schemas/estado-proyecto.schema';
import { CreateEstadoProyectoDto } from './dto/create-estado-proyecto.dto';
import { UpdateEstadoProyectoDto } from './dto/update-estado-proyecto.dto';
import { NotFoundException } from '@nestjs/common';

describe('EstadoProyectoService - Tests Unitarios', () => {
  let service: EstadoProyectoService;
  let mockEstadoProyectoModel: any;

  const mockEstadoProyecto = {
    _id: '507f1f77bcf86cd799439011',
    nombre: 'Activo',
    descripcion: 'Proyecto en curso',
    color: '#00ff00',
    deletedAt: null,
  };

  beforeEach(async () => {
    mockEstadoProyectoModel = function (dto: any) {
      return {
        ...dto,
        save: jest.fn().mockResolvedValue({ ...mockEstadoProyecto, ...dto }),
      };
    };

    mockEstadoProyectoModel.find = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue([mockEstadoProyecto]),
    });

    mockEstadoProyectoModel.findOne = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockEstadoProyecto),
    });

    mockEstadoProyectoModel.findOneAndUpdate = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockEstadoProyecto),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EstadoProyectoService,
        {
          provide: getModelToken(EstadoProyecto.name),
          useValue: mockEstadoProyectoModel,
        },
      ],
    }).compile();

    service = module.get<EstadoProyectoService>(EstadoProyectoService);
    jest.clearAllMocks();
  });

  it('debe estar definido el servicio', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debe crear un estado de proyecto correctamente', async () => {
      const createDto: CreateEstadoProyectoDto = {
        nombre: 'Finalizado',
        descripcion: 'Proyecto completado',
      };

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(result.nombre).toBe('Finalizado');
    });
  });

  describe('findAll', () => {
    it('debe retornar todos los estados de proyecto no eliminados', async () => {
      const result = await service.findAll();

      expect(result).toEqual([mockEstadoProyecto]);
      expect(result).toHaveLength(1);
    });

    it('debe retornar array vacío si no hay estados de proyecto', async () => {
      mockEstadoProyectoModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('debe retornar un estado de proyecto por su ID', async () => {
      const id = '507f1f77bcf86cd799439011';

      const result = await service.findOne(id);

      expect(result).toEqual(mockEstadoProyecto);
      expect((result as any)._id).toBe(id);
    });

    it('debe lanzar NotFoundException si el estado de proyecto no existe', async () => {
      const id = '507f1f77bcf86cd799439999';

      mockEstadoProyectoModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(id)).rejects.toThrow(
        `EstadoProyecto with ID ${id} not found`,
      );
    });
  });

  describe('update', () => {
    it('debe actualizar un estado de proyecto correctamente', async () => {
      const id = '507f1f77bcf86cd799439011';
      const updateDto: UpdateEstadoProyectoDto = {
        nombre: 'Pausado',
      };

      const updatedEstadoProyecto = { ...mockEstadoProyecto, ...updateDto };
      mockEstadoProyectoModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedEstadoProyecto),
      });

      const result = await service.update(id, updateDto);

      expect((result as any).nombre).toBe('Pausado');
    });

    it('debe lanzar NotFoundException si el estado de proyecto no existe', async () => {
      const id = '507f1f77bcf86cd799439999';
      const updateDto: UpdateEstadoProyectoDto = { nombre: 'Test' };

      mockEstadoProyectoModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.update(id, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('debe eliminar (soft delete) un estado de proyecto correctamente', async () => {
      const id = '507f1f77bcf86cd799439011';
      const deletedEstadoProyecto = {
        ...mockEstadoProyecto,
        deletedAt: new Date(),
      };

      mockEstadoProyectoModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(deletedEstadoProyecto),
      });

      const result = await service.remove(id);

      expect((result as any).deletedAt).toBeDefined();
      expect((result as any).deletedAt).not.toBeNull();
    });

    it('debe lanzar NotFoundException si el estado de proyecto no existe', async () => {
      const id = '507f1f77bcf86cd799439999';

      mockEstadoProyectoModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.remove(id)).rejects.toThrow(NotFoundException);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { TipoProyectoService } from './tipo-proyecto.service';
import { getModelToken } from '@nestjs/mongoose';
import { TipoProyecto } from './schemas/tipo-proyecto.schema';
import { CreateTipoProyectoDto } from './dto/create-tipo-proyecto.dto';
import { UpdateTipoProyectoDto } from './dto/update-tipo-proyecto.dto';
import { NotFoundException } from '@nestjs/common';

describe('TipoProyectoService - Tests Unitarios', () => {
  let service: TipoProyectoService;
  let mockTipoProyectoModel: any;

  const mockTipoProyecto = {
    _id: '507f1f77bcf86cd799439011',
    nombre: 'Desarrollo de Software',
    descripcion: 'Proyectos de desarrollo de aplicaciones',
    deletedAt: null,
  };

  beforeEach(async () => {
    mockTipoProyectoModel = function (dto: any) {
      return {
        ...dto,
        save: jest.fn().mockResolvedValue({ ...mockTipoProyecto, ...dto }),
      };
    };

    mockTipoProyectoModel.find = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue([mockTipoProyecto]),
    });

    mockTipoProyectoModel.findOne = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockTipoProyecto),
    });

    mockTipoProyectoModel.findOneAndUpdate = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockTipoProyecto),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TipoProyectoService,
        {
          provide: getModelToken(TipoProyecto.name),
          useValue: mockTipoProyectoModel,
        },
      ],
    }).compile();

    service = module.get<TipoProyectoService>(TipoProyectoService);
    jest.clearAllMocks();
  });

  it('debe estar definido el servicio', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('debe crear un tipo de proyecto correctamente', async () => {
      const createDto: CreateTipoProyectoDto = {
        nombre: 'Marketing Digital',
        descripcion: 'Proyectos de marketing',
      };

      const result = await service.create(createDto);

      expect(result).toBeDefined();
      expect(result.nombre).toBe('Marketing Digital');
    });
  });

  describe('findAll', () => {
    it('debe retornar todos los tipos de proyecto no eliminados', async () => {
      const result = await service.findAll();

      expect(result).toEqual([mockTipoProyecto]);
      expect(result).toHaveLength(1);
    });

    it('debe retornar array vacío si no hay tipos de proyecto', async () => {
      mockTipoProyectoModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('findOne', () => {
    it('debe retornar un tipo de proyecto por su ID', async () => {
      const id = '507f1f77bcf86cd799439011';

      const result = await service.findOne(id);

      expect(result).toEqual(mockTipoProyecto);
      expect((result as any)._id).toBe(id);
    });

    it('debe lanzar NotFoundException si el tipo de proyecto no existe', async () => {
      const id = '507f1f77bcf86cd799439999';

      mockTipoProyectoModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.findOne(id)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(id)).rejects.toThrow(
        `TipoProyecto with ID ${id} not found`,
      );
    });
  });

  describe('update', () => {
    it('debe actualizar un tipo de proyecto correctamente', async () => {
      const id = '507f1f77bcf86cd799439011';
      const updateDto: UpdateTipoProyectoDto = {
        nombre: 'Desarrollo Web Actualizado',
        descripcion: 'Descripción actualizada',
      };

      const updatedTipoProyecto = { ...mockTipoProyecto, ...updateDto };
      mockTipoProyectoModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(updatedTipoProyecto),
      });

      const result = await service.update(id, updateDto);

      expect((result as any).nombre).toBe('Desarrollo Web Actualizado');
      expect((result as any).descripcion).toBe('Descripción actualizada');
    });

    it('debe lanzar NotFoundException si el tipo de proyecto no existe', async () => {
      const id = '507f1f77bcf86cd799439999';
      const updateDto: UpdateTipoProyectoDto = { nombre: 'Test' };

      mockTipoProyectoModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.update(id, updateDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('debe eliminar (soft delete) un tipo de proyecto correctamente', async () => {
      const id = '507f1f77bcf86cd799439011';
      const deletedTipoProyecto = {
        ...mockTipoProyecto,
        deletedAt: new Date(),
      };

      mockTipoProyectoModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(deletedTipoProyecto),
      });

      const result = await service.remove(id);

      expect((result as any).deletedAt).toBeDefined();
      expect((result as any).deletedAt).not.toBeNull();
    });

    it('debe lanzar NotFoundException si el tipo de proyecto no existe', async () => {
      const id = '507f1f77bcf86cd799439999';

      mockTipoProyectoModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.remove(id)).rejects.toThrow(NotFoundException);
    });
  });
});

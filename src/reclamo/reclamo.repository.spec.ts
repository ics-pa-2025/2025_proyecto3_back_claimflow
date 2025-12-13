import { Test, TestingModule } from '@nestjs/testing';
import { ReclamoRepository } from './reclamo.repository';
import { getModelToken } from '@nestjs/mongoose';
import { Reclamo } from './schemas/reclamo.schema';
import { CreateReclamoDto } from './dto/create-reclamo.dto';

describe('ReclamoRepository - Tests Unitarios', () => {
  let repository: ReclamoRepository;
  let mockReclamoModel: any;

  const mockReclamo = {
    _id: '507f1f77bcf86cd799439011',
    tipo: 'Técnico',
    prioridad: 'Alta',
    criticidad: 'Crítica',
    descripcion: 'Problema con el servidor',
    evidencia: 'uploads/test.pdf',
    estado: 'Pendiente',
    area: 'Soporte',
    cliente: '507f1f77bcf86cd799439012',
    proyecto: '507f1f77bcf86cd799439013',
    historial: [
      {
        fecha: new Date(),
        accion: 'Reclamo creado',
        responsable: 'Sistema',
      },
    ],
  };

  beforeEach(async () => {
    mockReclamoModel = jest.fn().mockImplementation((dto) => ({
      ...mockReclamo,
      ...dto,
      save: jest.fn().mockResolvedValue({ ...mockReclamo, ...dto }),
    }));

    mockReclamoModel.find = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue([mockReclamo]),
    });

    mockReclamoModel.findById = jest.fn().mockReturnValue({
      populate: jest.fn().mockReturnThis(),
      exec: jest.fn().mockResolvedValue(mockReclamo),
    });

    mockReclamoModel.findByIdAndUpdate = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockReclamo),
    });

    mockReclamoModel.findByIdAndDelete = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockReclamo),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReclamoRepository,
        {
          provide: getModelToken(Reclamo.name),
          useValue: mockReclamoModel,
        },
      ],
    }).compile();

    repository = module.get<ReclamoRepository>(ReclamoRepository);
    jest.clearAllMocks();
  });

  it('debe estar definido el repositorio', () => {
    expect(repository).toBeDefined();
  });

  describe('create', () => {
    it('debe crear un reclamo con historial inicial', async () => {
      const createDto: CreateReclamoDto = {
        tipo: 'Técnico',
        prioridad: 'Alta',
        criticidad: 'Crítica',
        descripcion: 'Problema con el servidor',
        area: 'Soporte',
        cliente: '507f1f77bcf86cd799439012',
        proyecto: '507f1f77bcf86cd799439013',
      };

      const result = await repository.create(createDto);

      expect(result).toBeDefined();
      expect(mockReclamoModel).toHaveBeenCalled();
    });

    it('debe incluir historial al crear', async () => {
      const createDto: CreateReclamoDto = {
        tipo: 'Administrativo',
        prioridad: 'Media',
        criticidad: 'Media',
        descripcion: 'Consulta administrativa',
        area: 'Administración',
        cliente: '507f1f77bcf86cd799439012',
        proyecto: '507f1f77bcf86cd799439013',
      };

      const result = await repository.create(createDto);

      expect(result).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('debe retornar todos los reclamos con populate', async () => {
      const result = await repository.findAll();

      expect(result).toEqual([mockReclamo]);
      expect(mockReclamoModel.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('debe retornar un reclamo por ID con populate', async () => {
      const id = '507f1f77bcf86cd799439011';

      const result = await repository.findOne(id);

      expect(result).toEqual(mockReclamo);
      expect(mockReclamoModel.findById).toHaveBeenCalledWith(id);
    });

    it('debe retornar null si no encuentra el reclamo', async () => {
      const id = '507f1f77bcf86cd799439999';

      mockReclamoModel.findById = jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await repository.findOne(id);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('debe actualizar un reclamo correctamente', async () => {
      const id = '507f1f77bcf86cd799439011';
      const updateDto = {
        estado: 'En Proceso',
        prioridad: 'Media',
      };

      const result = await repository.update(id, updateDto);

      expect(result).toEqual(mockReclamo);
      expect(mockReclamoModel.findByIdAndUpdate).toHaveBeenCalledWith(
        id,
        updateDto,
        { new: true },
      );
    });

    it('debe retornar null si el reclamo no existe', async () => {
      const id = '507f1f77bcf86cd799439999';
      const updateDto = { estado: 'Cerrado' };

      mockReclamoModel.findByIdAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await repository.update(id, updateDto);

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('debe eliminar un reclamo correctamente', async () => {
      const id = '507f1f77bcf86cd799439011';

      const result = await repository.remove(id);

      expect(result).toEqual(mockReclamo);
      expect(mockReclamoModel.findByIdAndDelete).toHaveBeenCalledWith(id);
    });

    it('debe retornar null si el reclamo no existe', async () => {
      const id = '507f1f77bcf86cd799439999';

      mockReclamoModel.findByIdAndDelete = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await repository.remove(id);

      expect(result).toBeNull();
    });
  });
});

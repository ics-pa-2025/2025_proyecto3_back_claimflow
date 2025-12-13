import { Test, TestingModule } from '@nestjs/testing';
import { ReclamoService } from './reclamo.service';
import { ReclamoRepository } from './reclamo.repository';
import { CreateReclamoDto } from './dto/create-reclamo.dto';

describe('ReclamoService - Tests Unitarios', () => {
  let service: ReclamoService;
  let repository: ReclamoRepository;

  const mockReclamoRepository = {
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
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReclamoService,
        {
          provide: ReclamoRepository,
          useValue: mockReclamoRepository,
        },
      ],
    }).compile();

    service = module.get<ReclamoService>(ReclamoService);
    repository = module.get<ReclamoRepository>(ReclamoRepository);

    // Limpiar mocks antes de cada test
    jest.clearAllMocks();
  });

  it('debe estar definido el servicio', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
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

      mockReclamoRepository.create.mockResolvedValue(mockReclamo);

      const result = await service.create(createDto);

      expect(repository.create).toHaveBeenCalledWith(createDto);
      expect(repository.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockReclamo);
      expect(result.tipo).toBe('Técnico');
      expect(result.estado).toBe('Pendiente');
    });

    it('debe crear un reclamo con evidencia opcional', async () => {
      const createDto: CreateReclamoDto = {
        tipo: 'Administrativo',
        prioridad: 'Media',
        criticidad: 'Media',
        descripcion: 'Error en facturación',
        evidencia: 'uploads/factura.pdf',
        area: 'Administración',
        cliente: '507f1f77bcf86cd799439012',
        proyecto: '507f1f77bcf86cd799439013',
      };

      const reclamoConEvidencia = { ...mockReclamo, ...createDto };
      mockReclamoRepository.create.mockResolvedValue(reclamoConEvidencia);

      const result = await service.create(createDto);

      expect(result.evidencia).toBe('uploads/factura.pdf');
      expect(repository.create).toHaveBeenCalledWith(createDto);
    });

    it('debe manejar errores al crear un reclamo', async () => {
      const createDto: CreateReclamoDto = {
        tipo: 'Técnico',
        prioridad: 'Alta',
        criticidad: 'Crítica',
        descripcion: 'Problema con el servidor',
        area: 'Soporte',
        cliente: '507f1f77bcf86cd799439012',
        proyecto: '507f1f77bcf86cd799439013',
      };

      mockReclamoRepository.create.mockRejectedValue(
        new Error('Error al crear reclamo'),
      );

      await expect(service.create(createDto)).rejects.toThrow(
        'Error al crear reclamo',
      );
      expect(repository.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('debe retornar todos los reclamos', async () => {
      const reclamos = [
        mockReclamo,
        { ...mockReclamo, _id: '507f1f77bcf86cd799439014' },
      ];
      mockReclamoRepository.findAll.mockResolvedValue(reclamos);

      const result = await service.findAll();

      expect(repository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(reclamos);
      expect(result).toHaveLength(2);
    });

    it('debe retornar un array vacío si no hay reclamos', async () => {
      mockReclamoRepository.findAll.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('debe manejar errores al buscar reclamos', async () => {
      mockReclamoRepository.findAll.mockRejectedValue(
        new Error('Error de base de datos'),
      );

      await expect(service.findAll()).rejects.toThrow('Error de base de datos');
    });
  });

  describe('findOne', () => {
    it('debe retornar un reclamo por su ID', async () => {
      const id = '507f1f77bcf86cd799439011';
      mockReclamoRepository.findOne.mockResolvedValue(mockReclamo);

      const result = await service.findOne(id);

      expect(repository.findOne).toHaveBeenCalledWith(id);
      expect(repository.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockReclamo);
      expect((result as any)._id).toBe(id);
    });

    it('debe retornar null si el reclamo no existe', async () => {
      const id = '507f1f77bcf86cd799439999';
      mockReclamoRepository.findOne.mockResolvedValue(null);

      const result = await service.findOne(id);

      expect(result).toBeNull();
      expect(repository.findOne).toHaveBeenCalledWith(id);
    });

    it('debe manejar IDs inválidos', async () => {
      const invalidId = 'invalid-id';
      mockReclamoRepository.findOne.mockRejectedValue(new Error('ID inválido'));

      await expect(service.findOne(invalidId)).rejects.toThrow('ID inválido');
    });
  });

  describe('update', () => {
    it('debe actualizar un reclamo correctamente', async () => {
      const id = '507f1f77bcf86cd799439011';
      const updateDto = {
        estado: 'En Proceso',
        prioridad: 'Media',
      };

      const updatedReclamo = { ...mockReclamo, ...updateDto };
      mockReclamoRepository.update.mockResolvedValue(updatedReclamo);

      const result = await service.update(id, updateDto);

      expect(repository.update).toHaveBeenCalledWith(id, updateDto);
      expect((result as any).estado).toBe('En Proceso');
      expect((result as any).prioridad).toBe('Media');
    });

    it('debe actualizar solo los campos proporcionados', async () => {
      const id = '507f1f77bcf86cd799439011';
      const updateDto = { descripcion: 'Descripción actualizada' };

      const updatedReclamo = {
        ...mockReclamo,
        descripcion: updateDto.descripcion,
      };
      mockReclamoRepository.update.mockResolvedValue(updatedReclamo);

      const result = await service.update(id, updateDto);

      expect((result as any).descripcion).toBe('Descripción actualizada');
      expect((result as any).tipo).toBe(mockReclamo.tipo); // No debe cambiar
    });

    it('debe retornar null si el reclamo no existe', async () => {
      const id = '507f1f77bcf86cd799439999';
      const updateDto = { estado: 'Cerrado' };

      mockReclamoRepository.update.mockResolvedValue(null);

      const result = await service.update(id, updateDto);

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('debe eliminar un reclamo correctamente', async () => {
      const id = '507f1f77bcf86cd799439011';
      mockReclamoRepository.remove.mockResolvedValue(mockReclamo);

      const result = await service.remove(id);

      expect(repository.remove).toHaveBeenCalledWith(id);
      expect(repository.remove).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockReclamo);
    });

    it('debe retornar null si el reclamo no existe', async () => {
      const id = '507f1f77bcf86cd799439999';
      mockReclamoRepository.remove.mockResolvedValue(null);

      const result = await service.remove(id);

      expect(result).toBeNull();
      expect(repository.remove).toHaveBeenCalledWith(id);
    });

    it('debe manejar errores al eliminar', async () => {
      const id = '507f1f77bcf86cd799439011';
      mockReclamoRepository.remove.mockRejectedValue(
        new Error('Error al eliminar'),
      );

      await expect(service.remove(id)).rejects.toThrow('Error al eliminar');
    });
  });

  describe('Validación de lógica de negocio', () => {
    it('debe verificar que se llama al repositorio con los parámetros correctos', async () => {
      const createDto: CreateReclamoDto = {
        tipo: 'Técnico',
        prioridad: 'Alta',
        criticidad: 'Crítica',
        descripcion: 'Test',
        area: 'Soporte',
        cliente: '507f1f77bcf86cd799439012',
        proyecto: '507f1f77bcf86cd799439013',
      };

      mockReclamoRepository.create.mockResolvedValue(mockReclamo);

      await service.create(createDto);

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          tipo: 'Técnico',
          prioridad: 'Alta',
          criticidad: 'Crítica',
          descripcion: 'Test',
          area: 'Soporte',
          cliente: '507f1f77bcf86cd799439012',
          proyecto: '507f1f77bcf86cd799439013',
        }),
      );
    });
  });
});

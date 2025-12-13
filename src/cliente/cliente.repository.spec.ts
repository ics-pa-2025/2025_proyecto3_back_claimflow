import { Test, TestingModule } from '@nestjs/testing';
import { ClienteRepository } from './cliente.repository';
import { getModelToken } from '@nestjs/mongoose';
import { Cliente } from './schemas/cliente.schema';
import { CreateClienteDto } from './dto/create-cliente.dto';

describe('ClienteRepository - Tests Unitarios', () => {
  let repository: ClienteRepository;
  let mockClienteModel: any;

  const mockCliente = {
    _id: '507f1f77bcf86cd799439011',
    nombre: 'Juan',
    apellido: 'Pérez',
    dni: '12345678',
    email: 'juan.perez@example.com',
    telefono: '555-1234',
    proyectos: [],
    fechaEliminacion: null,
  };

  beforeEach(async () => {
    mockClienteModel = jest.fn().mockImplementation((dto) => ({
      ...mockCliente,
      ...dto,
      save: jest.fn().mockResolvedValue({ ...mockCliente, ...dto }),
    }));

    mockClienteModel.find = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue([mockCliente]),
    });

    mockClienteModel.findOne = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockCliente),
    });

    mockClienteModel.findOneAndUpdate = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockCliente),
    });

    mockClienteModel.findByIdAndUpdate = jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockCliente),
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClienteRepository,
        {
          provide: getModelToken(Cliente.name),
          useValue: mockClienteModel,
        },
      ],
    }).compile();

    repository = module.get<ClienteRepository>(ClienteRepository);
    jest.clearAllMocks();
  });

  it('debe estar definido el repositorio', () => {
    expect(repository).toBeDefined();
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

      const result = await repository.create(createDto);

      expect(result).toBeDefined();
      expect(mockClienteModel).toHaveBeenCalled();
    });

    it('debe crear un cliente con proyectos', async () => {
      const createDto: CreateClienteDto = {
        nombre: 'María',
        apellido: 'González',
        dni: '87654321',
        email: 'maria.gonzalez@example.com',
        proyectos: [
          { nombre: 'Proyecto A', tipo: 'Desarrollo' },
        ],
      };

      const result = await repository.create(createDto);

      expect(result).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('debe retornar todos los clientes no eliminados', async () => {
      const result = await repository.findAll();

      expect(result).toEqual([mockCliente]);
      expect(mockClienteModel.find).toHaveBeenCalledWith({
        fechaEliminacion: null,
      });
    });

    it('debe filtrar clientes eliminados', async () => {
      mockClienteModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([]),
      });

      const result = await repository.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('debe retornar un cliente por ID no eliminado', async () => {
      const id = '507f1f77bcf86cd799439011';

      const result = await repository.findOne(id);

      expect(result).toEqual(mockCliente);
      expect(mockClienteModel.findOne).toHaveBeenCalledWith({
        _id: id,
        fechaEliminacion: null,
      });
    });

    it('debe retornar null si el cliente está eliminado', async () => {
      const id = '507f1f77bcf86cd799439011';

      mockClienteModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await repository.findOne(id);

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('debe actualizar un cliente no eliminado', async () => {
      const id = '507f1f77bcf86cd799439011';
      const updateDto = {
        telefono: '555-9999',
        email: 'nuevo.email@example.com',
      };

      const result = await repository.update(id, updateDto);

      expect(result).toEqual(mockCliente);
      expect(mockClienteModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: id, fechaEliminacion: null },
        updateDto,
        { new: true },
      );
    });

    it('debe retornar null si el cliente no existe o está eliminado', async () => {
      const id = '507f1f77bcf86cd799439999';
      const updateDto = { nombre: 'Test' };

      mockClienteModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await repository.update(id, updateDto);

      expect(result).toBeNull();
    });
  });

  describe('remove', () => {
    it('debe marcar un cliente como eliminado (soft delete)', async () => {
      const id = '507f1f77bcf86cd799439011';
      const deletedCliente = {
        ...mockCliente,
        fechaEliminacion: new Date(),
      };

      mockClienteModel.findByIdAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(deletedCliente),
      });

      const result = await repository.remove(id);

      expect((result as any).fechaEliminacion).toBeDefined();
      expect(mockClienteModel.findByIdAndUpdate).toHaveBeenCalledWith(
        id,
        { fechaEliminacion: expect.any(Date) },
        { new: true },
      );
    });

    it('debe retornar null si el cliente no existe', async () => {
      const id = '507f1f77bcf86cd799439999';

      mockClienteModel.findByIdAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await repository.remove(id);

      expect(result).toBeNull();
    });
  });
});

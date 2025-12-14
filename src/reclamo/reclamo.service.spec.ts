import { Test, TestingModule } from '@nestjs/testing';
import { ReclamoService } from './reclamo.service';
import { ReclamoRepository } from './reclamo.repository';
import { EstadoReclamoService } from '../estado-reclamo/estado-reclamo.service';

const mockReclamoRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
};

const mockEstadoReclamoService = {
    findByNombre: jest.fn(),
};

describe('ReclamoService', () => {
    let service: ReclamoService;
    let repository: typeof mockReclamoRepository;
    let estadoService: typeof mockEstadoReclamoService;

    beforeEach(async () => {
        jest.clearAllMocks();
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReclamoService,
                { provide: ReclamoRepository, useValue: mockReclamoRepository },
                { provide: EstadoReclamoService, useValue: mockEstadoReclamoService },
            ],
        }).compile();

        service = module.get<ReclamoService>(ReclamoService);
        repository = module.get(ReclamoRepository);
        estadoService = module.get(EstadoReclamoService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should assign default estado if not provided', async () => {
        const dto = { tipo: 'Test', prioridad: 'Alta', criticidad: 'Alta', descripcion: 'Desc', area: 'IT', cliente: '123', proyecto: '456' };
        const defaultEstado = { _id: 'default_id', nombre: 'Pendiente' };

        estadoService.findByNombre.mockResolvedValue(defaultEstado);
        repository.create.mockResolvedValue({ ...dto, estado: defaultEstado._id });

        await service.create(dto as any);

        expect(estadoService.findByNombre).toHaveBeenCalledWith('Pendiente');
        expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ estado: 'default_id' }));
    });

    it('should use provided estado if present', async () => {
        const dto = { tipo: 'Test', prioridad: 'Alta', criticidad: 'Alta', descripcion: 'Desc', area: 'IT', cliente: '123', proyecto: '456', estado: 'explicit_id' };

        repository.create.mockResolvedValue(dto);

        await service.create(dto as any);

        expect(estadoService.findByNombre).not.toHaveBeenCalled();
        expect(repository.create).toHaveBeenCalledWith(expect.objectContaining({ estado: 'explicit_id' }));
    });
});

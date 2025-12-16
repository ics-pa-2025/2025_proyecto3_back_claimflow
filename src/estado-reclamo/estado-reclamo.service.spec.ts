import { Test, TestingModule } from '@nestjs/testing';
import { EstadoReclamoService } from './estado-reclamo.service';
import { EstadoReclamoRepository } from './estado-reclamo.repository';

const mockEstadoReclamoRepository = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findByNombre: jest.fn(),
};

describe('EstadoReclamoService', () => {
    let service: EstadoReclamoService;
    let repository: typeof mockEstadoReclamoRepository;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EstadoReclamoService,
                { provide: EstadoReclamoRepository, useValue: mockEstadoReclamoRepository },
            ],
        }).compile();

        service = module.get<EstadoReclamoService>(EstadoReclamoService);
        repository = module.get(EstadoReclamoRepository);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should create a new estado reclamo', async () => {
        const dto = { nombre: 'Test', descripcion: 'Test desc', color: '#FFF' };
        const result = { _id: '1', ...dto };
        repository.create.mockResolvedValue(result);

        expect(await service.create(dto as any)).toEqual(result);
        expect(repository.create).toHaveBeenCalledWith(dto);
    });

    it('should find all estado reclamos', async () => {
        const result = [{ nombre: 'Test' }];
        repository.findAll.mockResolvedValue(result);

        expect(await service.findAll()).toEqual(result);
    });
});

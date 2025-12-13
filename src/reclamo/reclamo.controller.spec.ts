import { Test, TestingModule } from '@nestjs/testing';
import { ReclamoController } from './reclamo.controller';
import { ReclamoService } from './reclamo.service';
import { CreateReclamoDto } from './dto/create-reclamo.dto';
import { BadRequestException } from '@nestjs/common';
import { Readable } from 'stream';

describe('ReclamoController', () => {
  let controller: ReclamoController;
  let service: ReclamoService;

  const mockReclamoService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ReclamoController],
      providers: [
        {
          provide: ReclamoService,
          useValue: mockReclamoService,
        },
      ],
    }).compile();

    controller = module.get<ReclamoController>(ReclamoController);
    service = module.get<ReclamoService>(ReclamoService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a reclamo with file attachment', async () => {
      const dto: CreateReclamoDto = {
        tipo: 'Técnico',
        prioridad: 'Alta',
        criticidad: 'Media',
        descripcion: 'Falla en el sistema',
        area: 'Sistemas',
        cliente: 'client123',
        proyecto: 'proj123',
      };
      const file: Express.Multer.File = {
        path: 'uploads/testfile.txt',
        originalname: 'testfile.txt',
        mimetype: 'text/plain',
        size: 1024,
        fieldname: 'file',
        encoding: '7bit',
        destination: './uploads',
        filename: 'testfile.txt',
        buffer: Buffer.from('test'),
        stream: new Readable(),
      };

      const expectedResult = { ...dto, evidencia: file.path, _id: '1' };
      mockReclamoService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(dto, file);

      expect(result).toEqual(expectedResult);
      expect(dto.evidencia).toBe(file.path);
      expect(service.create).toHaveBeenCalledWith(dto);
    });

    it('should create a reclamo without file attachment', async () => {
      const dto: CreateReclamoDto = {
        tipo: 'Técnico',
        prioridad: 'Alta',
        criticidad: 'Media',
        descripcion: 'Falla en el sistema',
        area: 'Sistemas',
        cliente: 'client123',
        proyecto: 'proj123',
      };

      const expectedResult = { ...dto, _id: '1' };
      mockReclamoService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(dto);

      expect(result).toEqual(expectedResult);
      expect(dto.evidencia).toBeUndefined();
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });
});

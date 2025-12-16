import { Test, TestingModule } from '@nestjs/testing';
import { SolicitudReclamoService } from './solicitud-reclamo.service';

describe('SolicitudReclamoService', () => {
  let service: SolicitudReclamoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SolicitudReclamoService],
    }).compile();

    service = module.get<SolicitudReclamoService>(SolicitudReclamoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { SolicitudReclamoController } from './solicitud-reclamo.controller';
import { SolicitudReclamoService } from './solicitud-reclamo.service';

describe('SolicitudReclamoController', () => {
  let controller: SolicitudReclamoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SolicitudReclamoController],
      providers: [SolicitudReclamoService],
    }).compile();

    controller = module.get<SolicitudReclamoController>(SolicitudReclamoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';

describe('AppService - Tests Unitarios', () => {
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  it('debe estar definido el servicio', () => {
    expect(service).toBeDefined();
  });

  describe('getHello', () => {
    it('debe retornar mensaje de bienvenida', () => {
      const result = service.getHello();

      expect(result).toBe('Hello World!');
      expect(typeof result).toBe('string');
    });

    it('debe retornar el mismo mensaje en múltiples llamadas', () => {
      const result1 = service.getHello();
      const result2 = service.getHello();

      expect(result1).toBe(result2);
      expect(result1).toBe('Hello World!');
    });
  });
});

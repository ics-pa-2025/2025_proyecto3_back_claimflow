/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import * as dotenv from 'dotenv';
dotenv.config();

import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken, SchemaFactory } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ReclamoService } from './reclamo.service';
import { ReclamoRepository } from './reclamo.repository';
import { Reclamo } from './schemas/reclamo.schema';
import { CreateReclamoDto } from './dto/create-reclamo.dto';
import { Cliente } from '../cliente/schemas/cliente.schema';
import { Proyecto } from '../proyecto/schemas/proyecto.schema';

const shouldRunIntegrationTests = !!process.env.MONGO_URI;

(shouldRunIntegrationTests ? describe : describe.skip)(
  'ReclamoService (integración, MongoDB real)',
  () => {
    jest.setTimeout(30000);
    let service: ReclamoService;
    let reclamoModel: Model<Reclamo>;
    let clienteModel: Model<Cliente>;
    let proyectoModel: Model<Proyecto>;
    let moduleRef: TestingModule;

    let clienteId: string;
    let proyectoId: string;

    beforeAll(async () => {
      if (!process.env.MONGO_URI) {
        return;
      }

      const testDbUri =
        process.env.MONGO_TEST_URI || process.env.MONGO_URI + '_test';

      moduleRef = await Test.createTestingModule({
        imports: [
          MongooseModule.forRoot(testDbUri),
          MongooseModule.forFeature([
            {
              name: Reclamo.name,
              schema: SchemaFactory.createForClass(Reclamo),
            },
            {
              name: Cliente.name,
              schema: SchemaFactory.createForClass(Cliente),
            },
            {
              name: Proyecto.name,
              schema: SchemaFactory.createForClass(Proyecto),
            },
          ]),
        ],
        providers: [ReclamoService, ReclamoRepository],
      }).compile();

      service = moduleRef.get<ReclamoService>(ReclamoService);
      reclamoModel = moduleRef.get<Model<Reclamo>>(getModelToken(Reclamo.name));
      clienteModel = moduleRef.get<Model<Cliente>>(getModelToken(Cliente.name));
      proyectoModel = moduleRef.get<Model<Proyecto>>(
        getModelToken(Proyecto.name),
      );
    }, 30000);

    beforeEach(async () => {
      // Limpiar primero
      if (reclamoModel) await reclamoModel.deleteMany({});
      if (clienteModel) await clienteModel.deleteMany({});
      if (proyectoModel) await proyectoModel.deleteMany({});

      // Crear cliente y proyecto de prueba para los reclamos
      if (clienteModel && proyectoModel) {
        const cliente = await clienteModel.create({
          nombre: 'Cliente',
          apellido: 'Test',
          dni: '12345678',
          email: 'cliente@test.com',
        });
        clienteId = cliente._id.toString();

        const proyecto = await proyectoModel.create({
          nombre: 'Proyecto Test',
          descripcion: 'Descripción test',
        });
        proyectoId = proyecto._id.toString();
      }
    });

    afterEach(async () => {
      if (reclamoModel) await reclamoModel.deleteMany({});
      if (clienteModel) await clienteModel.deleteMany({});
      if (proyectoModel) await proyectoModel.deleteMany({});
    });

    afterAll(async () => {
      if (moduleRef) await moduleRef.close();
    });

    describe('create', () => {
      it('debe crear un reclamo correctamente', async () => {
        const dto: CreateReclamoDto = {
          tipo: 'Técnico',
          prioridad: 'Alta',
          criticidad: 'Crítica',
          descripcion: 'Problema con el servidor',
          area: 'Soporte',
          cliente: clienteId,
          proyecto: proyectoId,
        };

        const result = await service.create(dto);

        expect(result).toBeDefined();
        expect(result.tipo).toBe('Técnico');
        expect(result.prioridad).toBe('Alta');
        expect(result.criticidad).toBe('Crítica');
        expect(result.descripcion).toBe('Problema con el servidor');
        expect(result.estado).toBe('Pendiente'); // Estado por defecto
      });

      it('debe crear historial inicial al crear un reclamo', async () => {
        const dto: CreateReclamoDto = {
          tipo: 'Administrativo',
          prioridad: 'Media',
          criticidad: 'Media',
          descripcion: 'Consulta administrativa',
          area: 'Administración',
          cliente: clienteId,
          proyecto: proyectoId,
        };

        const result = await service.create(dto);

        expect(result.historial).toBeDefined();
        expect(result.historial.length).toBeGreaterThan(0);
        expect(result.historial[0].accion).toBe('Reclamo creado');
        expect(result.historial[0].responsable).toBe('Sistema');
      });

      it('debe permitir crear reclamo con evidencia', async () => {
        const dto: CreateReclamoDto = {
          tipo: 'Técnico',
          prioridad: 'Alta',
          criticidad: 'Alta',
          descripcion: 'Error con evidencia',
          evidencia: 'uploads/test.pdf',
          area: 'Soporte',
          cliente: clienteId,
          proyecto: proyectoId,
        };

        const result = await service.create(dto);

        expect(result.evidencia).toBe('uploads/test.pdf');
      });
    });

    describe('findAll', () => {
      it('debe retornar todos los reclamos con populate', async () => {
        await service.create({
          tipo: 'Técnico',
          prioridad: 'Alta',
          criticidad: 'Alta',
          descripcion: 'Reclamo 1',
          area: 'Soporte',
          cliente: clienteId,
          proyecto: proyectoId,
        });

        await service.create({
          tipo: 'Administrativo',
          prioridad: 'Baja',
          criticidad: 'Baja',
          descripcion: 'Reclamo 2',
          area: 'Administración',
          cliente: clienteId,
          proyecto: proyectoId,
        });

        const all = await service.findAll();

        expect(all.length).toBe(2);
        expect(all[0].tipo).toBeDefined();
        expect(all[1].tipo).toBeDefined();
      });

      it('debe retornar array vacío cuando no hay reclamos', async () => {
        const all = await service.findAll();

        expect(all).toEqual([]);
        expect(all.length).toBe(0);
      });
    });

    describe('findOne', () => {
      it('debe retornar un reclamo por ID con populate', async () => {
        const created = await service.create({
          tipo: 'Técnico',
          prioridad: 'Media',
          criticidad: 'Media',
          descripcion: 'Test findOne',
          area: 'Soporte',
          cliente: clienteId,
          proyecto: proyectoId,
        });

        const found = await service.findOne((created as any)._id.toString());

        expect(found).toBeDefined();
        expect((found as any).tipo).toBe('Técnico');
        expect((found as any).descripcion).toBe('Test findOne');
      });

      it('debe retornar null si el reclamo no existe', async () => {
        const found = await service.findOne('507f1f77bcf86cd799439011');

        expect(found).toBeNull();
      });
    });

    describe('update', () => {
      it('debe actualizar un reclamo correctamente', async () => {
        const created = await service.create({
          tipo: 'Técnico',
          prioridad: 'Baja',
          criticidad: 'Baja',
          descripcion: 'Original',
          area: 'Soporte',
          cliente: clienteId,
          proyecto: proyectoId,
        });

        const updated = await service.update((created as any)._id.toString(), {
          prioridad: 'Alta',
          estado: 'En Proceso',
          descripcion: 'Actualizado',
        });

        expect(updated).toBeDefined();
        expect((updated as any).prioridad).toBe('Alta');
        expect((updated as any).estado).toBe('En Proceso');
        expect((updated as any).descripcion).toBe('Actualizado');
      });

      it('debe retornar null si el reclamo no existe', async () => {
        const result = await service.update('507f1f77bcf86cd799439011', {
          estado: 'Cerrado',
        });

        expect(result).toBeNull();
      });

      it('debe permitir actualizar solo algunos campos', async () => {
        const created = await service.create({
          tipo: 'Administrativo',
          prioridad: 'Media',
          criticidad: 'Media',
          descripcion: 'Test parcial',
          area: 'Administración',
          cliente: clienteId,
          proyecto: proyectoId,
        });

        const updated = await service.update((created as any)._id.toString(), {
          estado: 'En Proceso',
        });

        expect((updated as any).estado).toBe('En Proceso');
        expect((updated as any).tipo).toBe('Administrativo'); // No cambió
        expect((updated as any).prioridad).toBe('Media'); // No cambió
      });
    });

    describe('remove', () => {
      it('debe eliminar un reclamo permanentemente', async () => {
        const created = await service.create({
          tipo: 'Técnico',
          prioridad: 'Alta',
          criticidad: 'Alta',
          descripcion: 'Para eliminar',
          area: 'Soporte',
          cliente: clienteId,
          proyecto: proyectoId,
        });

        const removed = await service.remove((created as any)._id.toString());

        expect(removed).toBeDefined();

        // Verificar que fue eliminado permanentemente
        const found = await service.findOne((created as any)._id.toString());
        expect(found).toBeNull();
      });

      it('debe retornar null si el reclamo no existe', async () => {
        const result = await service.remove('507f1f77bcf86cd799439011');

        expect(result).toBeNull();
      });
    });

    describe('validaciones de negocio', () => {
      it('debe validar tipos de reclamo permitidos', async () => {
        const tiposValidos = ['Técnico', 'Administrativo', 'Comercial'];

        for (const tipo of tiposValidos) {
          const dto: CreateReclamoDto = {
            tipo,
            prioridad: 'Media',
            criticidad: 'Media',
            descripcion: `Test ${tipo}`,
            area: 'Test',
            cliente: clienteId,
            proyecto: proyectoId,
          };

          const result = await service.create(dto);
          expect(result.tipo).toBe(tipo);

          await service.remove((result as any)._id.toString());
        }
      });

      it('debe validar prioridades permitidas', async () => {
        const prioridades = ['Baja', 'Media', 'Alta'];

        for (const prioridad of prioridades) {
          const dto: CreateReclamoDto = {
            tipo: 'Técnico',
            prioridad,
            criticidad: 'Media',
            descripcion: `Test ${prioridad}`,
            area: 'Test',
            cliente: clienteId,
            proyecto: proyectoId,
          };

          const result = await service.create(dto);
          expect(result.prioridad).toBe(prioridad);

          await service.remove((result as any)._id.toString());
        }
      });

      it('debe validar criticidades permitidas', async () => {
        const criticidades = ['Baja', 'Media', 'Alta', 'Crítica'];

        for (const criticidad of criticidades) {
          const dto: CreateReclamoDto = {
            tipo: 'Técnico',
            prioridad: 'Media',
            criticidad,
            descripcion: `Test ${criticidad}`,
            area: 'Test',
            cliente: clienteId,
            proyecto: proyectoId,
          };

          const result = await service.create(dto);
          expect(result.criticidad).toBe(criticidad);

          await service.remove((result as any)._id.toString());
        }
      });

      it('debe validar estados permitidos', async () => {
        const created = await service.create({
          tipo: 'Técnico',
          prioridad: 'Media',
          criticidad: 'Media',
          descripcion: 'Test estados',
          area: 'Test',
          cliente: clienteId,
          proyecto: proyectoId,
        });

        const estados = ['Pendiente', 'En Proceso', 'Resuelto', 'Cerrado'];

        for (const estado of estados) {
          const updated = await service.update(
            (created as any)._id.toString(),
            {
              estado,
            },
          );
          expect((updated as any).estado).toBe(estado);
        }
      });
    });

    describe('relaciones', () => {
      it('debe mantener referencia al cliente', async () => {
        const created = await service.create({
          tipo: 'Técnico',
          prioridad: 'Alta',
          criticidad: 'Alta',
          descripcion: 'Test cliente',
          area: 'Soporte',
          cliente: clienteId,
          proyecto: proyectoId,
        });

        const found = await service.findOne((created as any)._id.toString());

        expect((found as any).cliente).toBeDefined();
      });

      it('debe mantener referencia al proyecto', async () => {
        const created = await service.create({
          tipo: 'Técnico',
          prioridad: 'Alta',
          criticidad: 'Alta',
          descripcion: 'Test proyecto',
          area: 'Soporte',
          cliente: clienteId,
          proyecto: proyectoId,
        });

        const found = await service.findOne((created as any)._id.toString());

        expect((found as any).proyecto).toBeDefined();
      });
    });
  },
);

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unused-vars */
import * as dotenv from 'dotenv';
dotenv.config();

import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule, getModelToken, SchemaFactory } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClienteService } from './cliente.service';
import { ClienteRepository } from './cliente.repository';
import { Cliente } from './schemas/cliente.schema';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { ConflictException } from '@nestjs/common';
import { ProyectoService } from '../proyecto/proyecto.service';
import { Proyecto } from '../proyecto/schemas/proyecto.schema';

const shouldRunIntegrationTests = !!process.env.MONGO_URI;

(shouldRunIntegrationTests ? describe : describe.skip)(
  'ClienteService (integración, MongoDB real)',
  () => {
    jest.setTimeout(30000);
    let service: ClienteService;
    let clienteModel: Model<Cliente>;
    let proyectoModel: Model<Proyecto>;
    let moduleRef: TestingModule;

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
              name: Cliente.name,
              schema: SchemaFactory.createForClass(Cliente),
            },
            {
              name: Proyecto.name,
              schema: SchemaFactory.createForClass(Proyecto),
            },
          ]),
        ],
        providers: [
          ClienteService,
          ClienteRepository,
          {
            provide: ProyectoService,
            useValue: {
              removeClientFromProjects: jest.fn().mockResolvedValue(undefined),
            },
          },
        ],
      }).compile();

      service = moduleRef.get<ClienteService>(ClienteService);
      clienteModel = moduleRef.get<Model<Cliente>>(getModelToken(Cliente.name));
      proyectoModel = moduleRef.get<Model<Proyecto>>(
        getModelToken(Proyecto.name),
      );
    }, 30000);

    beforeEach(async () => {
      if (clienteModel) await clienteModel.deleteMany({});
      if (proyectoModel) await proyectoModel.deleteMany({});
    });

    afterEach(async () => {
      if (clienteModel) await clienteModel.deleteMany({});
      if (proyectoModel) await proyectoModel.deleteMany({});
    });

    afterAll(async () => {
      if (moduleRef) await moduleRef.close();
    });

    describe('create', () => {
      it('debe crear un cliente correctamente', async () => {
        const dto: CreateClienteDto = {
          nombre: 'Juan',
          apellido: 'Pérez',
          dni: '12345678',
          email: 'juan.perez@example.com',
          telefono: '555-1234',
        };

        const result = await service.create(dto);

        expect(result).toBeDefined();
        expect(result.nombre).toBe('Juan');
        expect(result.apellido).toBe('Pérez');
        expect(result.dni).toBe('12345678');
        expect(result.email).toBe('juan.perez@example.com');
      });

      it('debe lanzar ConflictException si el DNI ya existe', async () => {
        const dto: CreateClienteDto = {
          nombre: 'Juan',
          apellido: 'Pérez',
          dni: '99887766',
          email: 'juan1@example.com',
        };

        await service.create(dto);

        const duplicateDto: CreateClienteDto = {
          nombre: 'Pedro',
          apellido: 'González',
          dni: '99887766',
          email: 'pedro@example.com',
        };

        await expect(service.create(duplicateDto)).rejects.toThrow(
          ConflictException,
        );
      });

      it('debe lanzar ConflictException si el email ya existe', async () => {
        const dto: CreateClienteDto = {
          nombre: 'Juan',
          apellido: 'Pérez',
          dni: '44556677',
          email: 'unique-duplicate@example.com',
        };

        await service.create(dto);

        const duplicateDto: CreateClienteDto = {
          nombre: 'Pedro',
          apellido: 'González',
          dni: '88990011',
          email: 'unique-duplicate@example.com',
        };

        await expect(service.create(duplicateDto)).rejects.toThrow(
          ConflictException,
        );
      });
    });

    describe('findAll', () => {
      it('debe retornar todos los clientes no eliminados', async () => {
        await service.create({
          nombre: 'Cliente',
          apellido: 'Uno',
          dni: '11223344',
          email: 'uno-unique@example.com',
        });
        await service.create({
          nombre: 'Cliente',
          apellido: 'Dos',
          dni: '55667788',
          email: 'dos-unique@example.com',
        });

        const all = await service.findAll();

        expect(all.length).toBe(2);
        expect(all[0].nombre).toBe('Cliente');
      });

      it('debe retornar array vacío cuando no hay clientes', async () => {
        const all = await service.findAll();

        expect(Array.isArray(all)).toBe(true);
        expect(all.length).toBe(0);
      });

      it('debe excluir clientes con soft delete', async () => {
        const cliente1 = await service.create({
          nombre: 'Activo',
          apellido: 'Cliente',
          dni: '99001122',
          email: 'activo-test@example.com',
        });
        const cliente2 = await service.create({
          nombre: 'Eliminado',
          apellido: 'Cliente',
          dni: '33445566',
          email: 'eliminado-test@example.com',
        });

        // Soft delete del segundo cliente
        await service.remove((cliente2 as any)._id.toString());

        const all = await service.findAll();

        expect(all.length).toBe(1);
        expect((all[0] as any).nombre).toBe('Activo');
      });
    });

    describe('findOne', () => {
      it('debe retornar un cliente por ID', async () => {
        const created = await service.create({
          nombre: 'Test',
          apellido: 'Cliente',
          dni: '55555555',
          email: 'test@example.com',
        });

        const found = await service.findOne((created as any)._id.toString());

        expect(found).toBeDefined();
        expect((found as any).nombre).toBe('Test');
        expect((found as any).dni).toBe('55555555');
      });

      it('debe retornar null si el cliente no existe', async () => {
        const found = await service.findOne('507f1f77bcf86cd799439011');

        expect(found).toBeNull();
      });

      it('debe retornar null si el cliente está eliminado (soft delete)', async () => {
        const created = await service.create({
          nombre: 'Eliminado',
          apellido: 'Test',
          dni: '66666666',
          email: 'eliminado-test@example.com',
        });

        await service.remove((created as any)._id.toString());

        const found = await service.findOne((created as any)._id.toString());

        expect(found).toBeNull();
      });
    });

    describe('update', () => {
      it('debe actualizar un cliente correctamente', async () => {
        const created = await service.create({
          nombre: 'Original',
          apellido: 'Apellido',
          dni: '77777777',
          email: 'original@example.com',
        });

        const updated = await service.update((created as any)._id.toString(), {
          nombre: 'Actualizado',
          telefono: '555-9999',
        });

        expect(updated).toBeDefined();
        expect((updated as any).nombre).toBe('Actualizado');
        expect((updated as any).telefono).toBe('555-9999');
        expect((updated as any).apellido).toBe('Apellido'); // No cambió
      });

      it('debe retornar null si el cliente no existe', async () => {
        const result = await service.update('507f1f77bcf86cd799439011', {
          nombre: 'NoExiste',
        });

        expect(result).toBeNull();
      });

      it('debe retornar null si el cliente está eliminado', async () => {
        const created = await service.create({
          nombre: 'Eliminado',
          apellido: 'Update',
          dni: '88888888',
          email: 'eliminado-update@example.com',
        });

        await service.remove((created as any)._id.toString());

        const result = await service.update((created as any)._id.toString(), {
          nombre: 'Intento',
        });

        expect(result).toBeNull();
      });
    });

    describe('remove', () => {
      it('debe realizar soft delete de un cliente', async () => {
        const created = await service.create({
          nombre: 'ToDelete',
          apellido: 'Cliente',
          dni: '11998877',
          email: 'delete-unique@example.com',
        });

        const removed = await service.remove((created as any)._id.toString());

        expect(removed).toBeDefined();
        expect((removed as any).fechaEliminacion).toBeDefined();

        // Verificar que no aparece en findAll
        const all = await service.findAll();

        // Puede ser 0 o no incluir el eliminado
        const found = all.find(
          (c: any) => c._id.toString() === (created as any)._id.toString(),
        );
        expect(found).toBeUndefined();
      });

      it('debe retornar null si el cliente no existe', async () => {
        const result = await service.remove('507f1f77bcf86cd799439011');

        expect(result).toBeNull();
      });

      it('debe llamar a removeClientFromProjects antes de eliminar', async () => {
        const proyectoService = moduleRef.get<ProyectoService>(ProyectoService);
        const spy = jest.spyOn(proyectoService, 'removeClientFromProjects');

        const created = await service.create({
          nombre: 'Cliente',
          apellido: 'ConProyectos',
          dni: '10101010',
          email: 'proyectos@example.com',
        });

        await service.remove((created as any)._id.toString());

        expect(spy).toHaveBeenCalledWith((created as any)._id.toString());
      });
    });

    describe('validaciones de negocio', () => {
      it('debe permitir crear cliente y validar en la aplicación', async () => {
        const dto: CreateClienteDto = {
          nombre: 'Test',
          apellido: 'Email',
          dni: '11223344',
          email: 'valid@example.com',
        };

        const result = await service.create(dto);
        expect(result).toBeDefined();
        expect(result.email).toBe('valid@example.com');
      });

      it('debe permitir crear clientes sin teléfono', async () => {
        const dto: CreateClienteDto = {
          nombre: 'Sin',
          apellido: 'Telefono',
          dni: '55667788',
          email: 'sintel@example.com',
        };

        const result = await service.create(dto);

        expect(result).toBeDefined();
        expect(result.telefono).toBeUndefined();
      });
    });
  },
);

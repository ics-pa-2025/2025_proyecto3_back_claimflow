import { Controller, Get, Post, Body, Patch, Param, Delete, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ReclamoService } from './reclamo.service';
import { CreateReclamoDto } from './dto/create-reclamo.dto';
import { UpdateReclamoDto } from './dto/update-reclamo.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { HttpService } from '@nestjs/axios';
import { Request } from 'express';
import { lastValueFrom } from 'rxjs';

@Controller('reclamo')
export class ReclamoController {
    constructor(
        private readonly reclamoService: ReclamoService,
        private readonly httpService: HttpService,
    ) { }

    @Post()
    @UseInterceptors(FileInterceptor('file')) // Accept FormData but ignore file - files handled by ArchivoModule
    create(@Body() createReclamoDto: CreateReclamoDto, @UploadedFile() file?: any) {
        // File is ignored, files are now managed separately via /archivo endpoints
        return this.reclamoService.create(createReclamoDto);
    }

    @Get('dashboard/stats')
    async getDashboardStats(@Req() request: Request) {
        const authHeader = request.headers.authorization;
        let userId: string | undefined;
        let userRole: string | undefined;

        if (authHeader) {
            try {
                const token = authHeader.replace('Bearer ', '');
                const url = `http://auth-service-claimflow:3001/user/me`;
                const response = await lastValueFrom(
                    this.httpService.get(url, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                );
                const user = response.data;
                userId = user.id;
                userRole = user.roles && user.roles.length > 0 ? user.roles[0].name : null;
            } catch (error) {
                console.error('Error fetching user info for stats:', error.message);
                // Optionally handle error, e.g., proceed as guest or throw
            }
        }

        return this.reclamoService.getDashboardStats(userId, userRole);
    }

    @Get('dashboard/chart-days')
    async getChartDays(@Req() request: Request) {
        const authHeader = request.headers.authorization;
        let userId: string | undefined;
        let userRole: string | undefined;

        if (authHeader) {
            try {
                const token = authHeader.replace('Bearer ', '');
                const url = `http://auth-service-claimflow:3001/user/me`;
                const response = await lastValueFrom(
                    this.httpService.get(url, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                );
                const user = response.data;
                userId = user.id;
                userRole = user.roles && user.roles.length > 0 ? user.roles[0].name : null;
            } catch (error) {
                console.error('Error fetching user info for chart:', error.message);
            }
        }

        return this.reclamoService.getReclamosPorDia(userId, userRole);
    }

    @Get('dashboard/chart-areas')
    async getChartAreas(@Req() request: Request) {
        const authHeader = request.headers.authorization;
        let userId: string | undefined;
        let userRole: string | undefined;

        if (authHeader) {
            try {
                const token = authHeader.replace('Bearer ', '');
                const url = `http://auth-service-claimflow:3001/user/me`;
                const response = await lastValueFrom(
                    this.httpService.get(url, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                );
                const user = response.data;
                userId = user.id;
                userRole = user.roles && user.roles.length > 0 ? user.roles[0].name : null;
            } catch (error) {
                console.error('Error fetching user info for areas chart:', error.message);
            }
        }

        return this.reclamoService.getReclamosPorArea(userId, userRole);
    }

    @Get('dashboard/chart-tipos')
    async getChartTipos(@Req() request: Request) {
        const authHeader = request.headers.authorization;
        let userId: string | undefined;
        let userRole: string | undefined;

        if (authHeader) {
            try {
                const token = authHeader.replace('Bearer ', '');
                const url = `http://auth-service-claimflow:3001/user/me`;
                const response = await lastValueFrom(
                    this.httpService.get(url, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                );
                const user = response.data;
                userId = user.id;
                userRole = user.roles && user.roles.length > 0 ? user.roles[0].name : null;
            } catch (error) {
                console.error('Error fetching user info for tipos chart:', error.message);
            }
        }

        return this.reclamoService.getReclamosPorTipo(userId, userRole);
    }

    @Get('dashboard/chart-responsables')
    async getChartResponsables(@Req() request: Request) {
        const authHeader = request.headers.authorization;
        let userId: string | undefined;
        let userRole: string | undefined;

        if (authHeader) {
            try {
                const token = authHeader.replace('Bearer ', '');
                const url = `http://auth-service-claimflow:3001/user/me`;
                const response = await lastValueFrom(
                    this.httpService.get(url, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                );
                const user = response.data;
                userId = user.id;
                userRole = user.roles && user.roles.length > 0 ? user.roles[0].name : null;
            } catch (error) {
                console.error('Error fetching user info for responsables chart:', error.message);
            }
        }

        return this.reclamoService.getReclamosPorResponsable(userId, userRole);
    }

    @Get()
    async findAll(@Req() request: Request) {
        const authHeader = request.headers.authorization;
        if (!authHeader) {
            return this.reclamoService.findAll();
        }

        try {
            const token = authHeader.replace('Bearer ', '');
            // Call auth service to get user info
            const url = `http://auth-service-claimflow:3001/user/me`;
            const response = await lastValueFrom(
                this.httpService.get(url, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            );


            const user = response.data;
            const userRole = user.roles && user.roles.length > 0 ? user.roles[0].name : null;

            console.log('User ID:', user.id);
            console.log('User Role:', userRole);

            return this.reclamoService.findAll(user.id, userRole);
        } catch (error) {
            console.error('Error fetching user info:', error.message);
            // If auth validation fails, fall back to returning public list of reclamos
            return this.reclamoService.findAll();
        }
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.reclamoService.findOne(id);
    }

    @Patch(':id')
    @UseInterceptors(FileInterceptor('file')) // Accept FormData but ignore file - files handled by ArchivoModule
    update(@Param('id') id: string, @Body() updateReclamoDto: UpdateReclamoDto, @UploadedFile() file?: any) {
        // File is ignored, files are now managed separately via /archivo endpoints
        return this.reclamoService.update(id, updateReclamoDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.reclamoService.remove(id);
    }
}

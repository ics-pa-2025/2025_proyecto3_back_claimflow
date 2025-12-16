import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, BadRequestException, Req } from '@nestjs/common';
import { ReclamoService } from './reclamo.service';
import { CreateReclamoDto } from './dto/create-reclamo.dto';
import { UpdateReclamoDto } from './dto/update-reclamo.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
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
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                return cb(null, `${randomName}${extname(file.originalname)}`);
            }
        })
    }))
    create(@Body() createReclamoDto: CreateReclamoDto, @UploadedFile() file?: any) {
        if (file) {
            createReclamoDto.evidencia = file.path;
        }
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
            // FAIL CLOSE: If auth fails, DO NOT return all claims
            // Throw error or return empty
            throw new BadRequestException('Could not validate user identity');
        }
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.reclamoService.findOne(id);
    }

    @Patch(':id')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                return cb(null, `${randomName}${extname(file.originalname)}`);
            }
        })
    }))
    update(@Param('id') id: string, @Body() updateReclamoDto: UpdateReclamoDto, @UploadedFile() file?: any) {
        if (file) {
            updateReclamoDto.evidencia = file.path;
        }
        return this.reclamoService.update(id, updateReclamoDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.reclamoService.remove(id);
    }
}

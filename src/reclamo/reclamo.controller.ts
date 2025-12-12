import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { ReclamoService } from './reclamo.service';
import { CreateReclamoDto } from './dto/create-reclamo.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('reclamo')
export class ReclamoController {
    constructor(private readonly reclamoService: ReclamoService) { }

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

    @Get()
    findAll() {
        return this.reclamoService.findAll();
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
    update(@Param('id') id: string, @Body() updateReclamoDto: any, @UploadedFile() file?: any) {
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

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageTemplate } from '../entities/message-template.entity';
import { CreateTemplateDto } from '../dto/create-template.dto';
import { UpdateTemplateDto } from '../dto/update-template.dto';

@Injectable()
export class MessageTemplateService {
  constructor(
    @InjectRepository(MessageTemplate)
    private readonly repo: Repository<MessageTemplate>,
  ) {}

  create(dto: CreateTemplateDto): Promise<MessageTemplate> {
    return this.repo.save(this.repo.create(dto));
  }

  findAll(): Promise<MessageTemplate[]> {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<MessageTemplate> {
    const template = await this.repo.findOne({ where: { id } });
    if (!template) throw new NotFoundException(`Template "${id}" not found`);
    return template;
  }

  async update(id: string, dto: UpdateTemplateDto): Promise<MessageTemplate> {
    const template = await this.findOne(id);
    Object.assign(template, dto);
    return this.repo.save(template);
  }

  async remove(id: string): Promise<{ message: string }> {
    const template = await this.findOne(id);
    await this.repo.remove(template);
    return { message: 'Template deleted successfully' };
  }
}

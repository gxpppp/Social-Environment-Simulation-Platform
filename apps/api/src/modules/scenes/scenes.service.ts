import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Scene } from '../../entities/scene.entity';

@Injectable()
export class ScenesService {
  constructor(
    @InjectRepository(Scene)
    private sceneRepository: Repository<Scene>,
  ) {}

  async findAll(): Promise<Scene[]> {
    return this.sceneRepository.find({ 
      relations: ['createdBy', 'agents']
    });
  }

  async findOne(id: string): Promise<Scene> {
    return this.sceneRepository.findOne({ 
      where: { id },
      relations: ['createdBy', 'agents']
    });
  }

  async create(sceneData: Partial<Scene>): Promise<Scene> {
    const scene = this.sceneRepository.create(sceneData);
    return this.sceneRepository.save(scene);
  }

  async update(id: string, updateData: Partial<Scene>): Promise<Scene> {
    await this.sceneRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.sceneRepository.delete(id);
  }
}

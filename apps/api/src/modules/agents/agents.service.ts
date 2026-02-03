import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Agent } from '../../entities/agent.entity';

@Injectable()
export class AgentsService {
  constructor(
    @InjectRepository(Agent)
    private agentRepository: Repository<Agent>,
  ) {}

  async findAll(): Promise<Agent[]> {
    return this.agentRepository.find({ relations: ['createdBy'] });
  }

  async findOne(id: string): Promise<Agent> {
    return this.agentRepository.findOne({ 
      where: { id },
      relations: ['createdBy']
    });
  }

  async create(agentData: Partial<Agent>): Promise<Agent> {
    const agent = this.agentRepository.create(agentData);
    return this.agentRepository.save(agent);
  }

  async update(id: string, updateData: Partial<Agent>): Promise<Agent> {
    await this.agentRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.agentRepository.delete(id);
  }
}

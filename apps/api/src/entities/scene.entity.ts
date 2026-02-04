import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Agent } from './agent.entity';

@Entity('scenes')
export class Scene {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  type: string;

  @Column({ type: 'json' })
  config: {
    duration: number;
    timeStep: string;
    environment?: Record<string, any>;
    rules?: Record<string, any>;
    agents?: Array<{
      agentId: string;
      initialStance: number;
      role: string;
    }>;
  };

  @Column({ default: 'draft' })
  status: string;

  @Column({ default: 'private' })
  visibility: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdBy' })
  createdBy: User;

  @OneToMany(() => Agent, agent => agent.id)
  agents: Agent[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

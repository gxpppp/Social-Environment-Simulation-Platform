import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

// 配置
import { databaseConfig } from './config/database.config';

// 模块
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AgentsModule } from './modules/agents/agents.module';
import { ScenesModule } from './modules/scenes/scenes.module';
import { SimulationsModule } from './modules/simulations/simulations.module';
import { ModelModule } from './modules/model/model.module';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // 数据库模块
    TypeOrmModule.forRoot(databaseConfig),

    // 业务模块
    AuthModule,
    UsersModule,
    AgentsModule,
    ScenesModule,
    SimulationsModule,
    ModelModule,
  ],
})
export class AppModule {}

import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { ModelService } from './model.service';
import { ModelController } from './model.controller';
import { PromptTemplateService } from './prompt-template.service';

@Module({
  imports: [
    HttpModule,
    ConfigModule,
  ],
  providers: [ModelService, PromptTemplateService],
  controllers: [ModelController],
  exports: [ModelService, PromptTemplateService],
})
export class ModelModule {}

import { CacheModuleOptions } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';

export const redisConfig = (configService: ConfigService): CacheModuleOptions => ({
  store: redisStore,
  host: configService.get('REDIS_HOST', 'localhost'),
  port: configService.get('REDIS_PORT', 6379),
  ttl: 300, // 默认缓存5分钟
  max: 100, // 最大缓存条目数
});

// 缓存键前缀
export const CACHE_KEYS = {
  AGENTS: 'agents',
  SCENES: 'scenes',
  MODELS: 'models',
  SIMULATION_STATUS: 'simulation:status',
} as const;

// 缓存TTL配置（秒）
export const CACHE_TTL = {
  AGENTS: 60, // 1分钟
  SCENES: 60,
  MODELS: 3600, // 1小时
  SIMULATION_STATUS: 5, // 5秒
} as const;

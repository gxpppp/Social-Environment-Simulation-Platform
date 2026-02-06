import { CacheModuleOptions } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';

export const getRedisConfig = (configService: ConfigService): CacheModuleOptions => ({
  store: redisStore,
  host: configService.get('REDIS_HOST', 'localhost'),
  port: configService.get('REDIS_PORT', 6379),
  password: configService.get('REDIS_PASSWORD', undefined),
  db: configService.get('REDIS_DB', 0),
  ttl: configService.get('REDIS_TTL', 3600), // 默认1小时
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
});

export const CACHE_KEYS = {
  SCENES: 'scenes',
  AGENTS: 'agents',
  SIMULATIONS: 'simulations',
  USERS: 'users',
  ANALYTICS: 'analytics',
} as const;

export const CACHE_TTL = {
  SHORT: 60,      // 1分钟
  MEDIUM: 300,    // 5分钟
  LONG: 3600,     // 1小时
  VERY_LONG: 86400, // 1天
} as const;

import { TypeOrmModuleOptions } from '@nestjs/typeorm';

// 开发环境使用SQLite文件数据库（无需额外安装）
export const databaseConfig: TypeOrmModuleOptions = {
  type: 'sqljs',
  autoSave: true,
  location: './data/sesp.db',
  entities: [__dirname + '/../entities/*.entity{.ts,.js}'],
  synchronize: true,
  logging: false,
};

// 生产环境使用PostgreSQL
// export const databaseConfig: TypeOrmModuleOptions = {
//   type: 'postgres',
//   host: process.env.DB_HOST || 'localhost',
//   port: parseInt(process.env.DB_PORT || '5432', 10),
//   username: process.env.DB_USERNAME || 'sesp',
//   password: process.env.DB_PASSWORD || 'sesp123',
//   database: process.env.DB_NAME || 'sesp_db',
//   entities: [__dirname + '/../entities/*.entity{.ts,.js}'],
//   synchronize: process.env.NODE_ENV !== 'production',
//   logging: process.env.NODE_ENV === 'development',
// };

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexes implements MigrationInterface {
  name = 'AddIndexes';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Agent表索引
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_agents_status ON agents(status);
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_agents_created_by ON agents("createdById");
    `);

    // Scene表索引
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_scenes_type ON scenes(type);
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_scenes_status ON scenes(status);
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_scenes_created_by ON scenes("createdById");
    `);

    // User表索引
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 删除索引
    await queryRunner.query(`DROP INDEX IF EXISTS idx_agents_status;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_agents_created_by;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_scenes_type;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_scenes_status;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_scenes_created_by;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_email;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_role;`);
  }
}

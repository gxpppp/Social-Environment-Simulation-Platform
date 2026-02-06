import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../entities/user.entity';

async function seedAdmin() {
  const dataSource = new DataSource({
    type: 'sqljs',
    autoSave: true,
    location: './data/sesp.db',
    entities: [__dirname + '/../entities/*.entity{.ts,.js}'],
    synchronize: true,
    logging: false,
  });

  try {
    await dataSource.initialize();
    console.log('Database connected');

    const userRepository = dataSource.getRepository(User);

    // 检查是否已存在 admin 用户
    const existingAdmin = await userRepository.findOne({
      where: { email: 'admin@sesp.com' },
    });

    if (existingAdmin) {
      console.log('Admin user already exists');
      await dataSource.destroy();
      return;
    }

    // 创建 admin 用户
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = userRepository.create({
      email: 'admin@sesp.com',
      password: hashedPassword,
      name: 'Administrator',
      role: 'admin',
    });

    await userRepository.save(admin);
    console.log('Admin user created successfully');
    console.log('Email: admin@sesp.com');
    console.log('Password: admin123');

  } catch (error) {
    console.error('Error seeding admin:', error);
  } finally {
    await dataSource.destroy();
  }
}

seedAdmin();

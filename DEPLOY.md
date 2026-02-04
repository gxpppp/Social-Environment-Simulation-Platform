# SESP 部署指南

## 快速开始

### 方式一：Docker Compose部署（推荐）

1. **克隆项目**
```bash
git clone <repository-url>
cd multi-agent
```

2. **配置环境变量**
```bash
cp .env.example .env
# 编辑.env文件，设置你的API密钥
```

3. **启动服务**
```bash
docker-compose up -d
```

4. **访问应用**
- 前端：http://localhost
- 后端API：http://localhost:3000
- API文档：http://localhost:3000/api

### 方式二：本地开发部署

#### 前提条件
- Node.js 20+
- PostgreSQL 15+
- Neo4j 5+
- Redis 7+

#### 1. 安装依赖
```bash
# 根目录
npm install

# 后端
cd apps/api
npm install

# 前端
cd apps/web
npm install
```

#### 2. 配置数据库
```bash
# 启动PostgreSQL、Neo4j、Redis
# 创建数据库和用户
```

#### 3. 配置环境变量
```bash
cp .env.example .env
# 编辑.env配置数据库连接
```

#### 4. 运行数据库迁移
```bash
cd apps/api
npm run migration:run
```

#### 5. 启动服务
```bash
# 后端（端口3000）
cd apps/api
npm run dev

# 前端（端口5173）
cd apps/web
npm run dev
```

## 生产部署

### 使用Docker Compose

```bash
# 构建并启动
docker-compose -f docker-compose.yml up -d --build

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 环境变量说明

| 变量名 | 说明 | 默认值 |
|-------|------|--------|
| DB_HOST | PostgreSQL主机 | localhost |
| DB_PORT | PostgreSQL端口 | 5432 |
| DB_USERNAME | 数据库用户名 | sesp |
| DB_PASSWORD | 数据库密码 | sesp123 |
| NEO4J_URI | Neo4j连接URI | bolt://localhost:7687 |
| NEO4J_USER | Neo4j用户名 | neo4j |
| NEO4J_PASSWORD | Neo4j密码 | sesp123 |
| REDIS_HOST | Redis主机 | localhost |
| JWT_SECRET | JWT签名密钥 | - |
| SILICON_FLOW_API_KEY | Silicon Flow API密钥 | - |

### 端口说明

| 服务 | 端口 | 说明 |
|-----|------|------|
| Web | 80 | 前端应用 |
| API | 3000 | 后端API |
| PostgreSQL | 5432 | 关系数据库 |
| Neo4j HTTP | 7474 | 图数据库Web界面 |
| Neo4j Bolt | 7687 | 图数据库连接 |
| Redis | 6379 | 缓存服务 |

## 故障排除

### 前端构建失败
检查TypeScript错误：
```bash
cd apps/web
npm run build
```

### 后端启动失败
检查数据库连接：
```bash
cd apps/api
npm run type-check
```

### 数据库连接失败
确保数据库服务已启动：
```bash
# PostgreSQL
docker ps | grep postgres

# Neo4j
docker ps | grep neo4j
```

## 系统要求

- **CPU**: 4核+
- **内存**: 8GB+
- **磁盘**: 50GB+
- **操作系统**: Linux/macOS/Windows with WSL2

## 安全建议

1. 修改默认密码
2. 使用HTTPS
3. 配置防火墙
4. 定期备份数据库
5. 更新依赖包

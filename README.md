# SESP - 社会环境模拟平台

基于多智能体的社会环境模拟平台 (Social Environment Simulation Platform)

## 项目概述

SESP 是一个用于模拟和分析社会环境中多智能体交互的平台，支持政策影响评估、舆论演化分析、市场竞争模拟等多种场景。

## 技术栈

### 后端
- **框架**: NestJS 10.x
- **数据库**: PostgreSQL 16 + Neo4j 5.x
- **缓存**: Redis 7.x
- **认证**: JWT + Passport
- **API文档**: Swagger/OpenAPI
- **实时通信**: WebSocket (Socket.io)

### 前端
- **框架**: React 18 + TypeScript
- **构建工具**: Vite 5.x
- **UI组件库**: Ant Design 5.x
- **状态管理**: Zustand + React Query
- **可视化**: ECharts + D3.js + Cytoscape.js

## 项目结构

```
.
├── apps/
│   ├── api/                 # NestJS 后端应用
│   │   ├── src/
│   │   │   ├── entities/    # 数据库实体
│   │   │   ├── modules/     # 业务模块
│   │   │   │   ├── auth/    # 认证模块
│   │   │   │   ├── users/   # 用户模块
│   │   │   │   ├── agents/  # AI角色模块
│   │   │   │   ├── scenes/  # 场景模块
│   │   │   │   └── simulations/ # 模拟模块
│   │   │   ├── config/      # 配置文件
│   │   │   ├── main.ts      # 应用入口
│   │   │   └── app.module.ts
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── web/                 # React 前端应用
│       ├── src/
│       │   ├── components/  # 组件
│       │   ├── pages/       # 页面
│       │   │   ├── Dashboard/    # 工作台
│       │   │   ├── Scenes/       # 场景管理
│       │   │   ├── Agents/       # 角色管理
│       │   │   ├── Simulation/   # 模拟控制
│       │   │   ├── Analytics/    # 分析中心
│       │   │   └── Settings/     # 系统设置
│       │   ├── layouts/     # 布局组件
│       │   ├── router/      # 路由配置
│       │   ├── stores/      # 状态管理
│       │   ├── services/    # API服务
│       │   ├── styles/      # 全局样式
│       │   └── main.tsx     # 应用入口
│       ├── index.html
│       ├── vite.config.ts
│       └── package.json
│
├── docker-compose.yml       # Docker编排配置
├── package.json             # 根package.json
├── turbo.json              # Turborepo配置
└── pnpm-workspace.yaml     # pnpm工作区配置
```

## 快速开始

### 环境要求
- Node.js >= 20.0.0
- pnpm >= 8.0.0
- Docker & Docker Compose

### 安装依赖

```bash
# 安装pnpm（如果还没有安装）
npm install -g pnpm

# 安装项目依赖
pnpm install
```

### 启动开发环境

#### 方式1: 使用 Docker Compose（推荐）

```bash
# 启动所有服务（数据库 + 后端 + 前端）
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

服务将运行在:
- 前端: http://localhost:3000
- 后端API: http://localhost:8080
- API文档: http://localhost:8080/api/docs
- Neo4j浏览器: http://localhost:7474

#### 方式2: 本地开发

```bash
# 1. 启动数据库
docker-compose up -d postgres neo4j redis

# 2. 启动后端
cd apps/api
pnpm install
pnpm run dev

# 3. 启动前端（新终端）
cd apps/web
pnpm install
pnpm run dev
```

## 功能模块

### 已实现功能 (P0阶段)

- [x] 用户认证（注册/登录/JWT）
- [x] 用户管理
- [x] AI角色管理（CRUD）
- [x] **AI角色属性编辑器** - Big Five人格模型可视化编辑
- [x] **Silicon Flow API集成** - LLM调用服务
- [x] 场景管理（CRUD）
- [x] **场景编辑器** - 可视化配置界面
- [x] 模拟控制（创建/暂停/恢复/停止）
- [x] WebSocket实时通信
- [x] 基础前端界面

### 待开发功能 (P1阶段)

- [ ] 模拟引擎核心（多智能体协调）
- [ ] 网络关系图可视化
- [ ] 时间轴事件流
- [ ] 实时指标仪表盘
- [ ] 分析报告生成
- [ ] 数据导出功能

## API文档

启动服务后访问: http://localhost:8080/api/docs

主要API端点:
- `POST /auth/login` - 用户登录
- `POST /auth/register` - 用户注册
- `GET /users` - 获取用户列表
- `GET /agents` - 获取AI角色列表
- `POST /agents` - 创建AI角色
- `GET /scenes` - 获取场景列表
- `POST /scenes` - 创建场景
- `GET /simulations` - 获取模拟会话列表
- `POST /simulations` - 创建模拟会话

## 开发指南

### 添加新模块

1. 在后端 `apps/api/src/modules/` 创建新模块
2. 在 `app.module.ts` 中导入新模块
3. 在前端 `apps/web/src/pages/` 创建对应页面
4. 在 `router/index.tsx` 中添加路由

### 代码规范

- 使用 TypeScript 严格模式
- 遵循 ESLint 和 Prettier 配置
- 组件使用 PascalCase 命名
- Hooks 使用 camelCase 并以 `use` 开头

### 提交规范

```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试相关
chore: 构建/工具相关
```

## 设计文档

详细设计文档位于项目根目录:
- `04-社会环境模拟平台-需求分析与规划.md`
- `05-社会环境模拟平台-架构设计.md`
- `06-社会环境模拟平台-前端设计与开发.md`

## 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 许可证

[MIT](LICENSE)

## 联系方式

如有问题或建议，欢迎提交 Issue 或 Pull Request。

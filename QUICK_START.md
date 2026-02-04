# SESP 快速启动指南（无Docker版）

## 系统要求

- Node.js 20+
- Windows/macOS/Linux

## 快速启动步骤

### 1. 安装依赖

```bash
# 在根目录
npm install

# 后端依赖
cd apps/api
npm install

# 前端依赖
cd apps/web
npm install
```

### 2. 配置环境变量

编辑 `.env` 文件：

```env
# 必须配置
SILICON_FLOW_API_KEY=your-actual-api-key-here

# 其他配置保持默认即可
```

### 3. 启动后端服务

```bash
cd apps/api
npm run dev
```

后端将在 http://localhost:3000 启动

### 4. 启动前端服务（新终端）

```bash
cd apps/web
npm run dev
```

前端将在 http://localhost:5173 启动

### 5. 访问应用

打开浏览器访问：http://localhost:5173

## 功能验证

1. **注册账号** - 使用任意邮箱注册
2. **创建Agent** - 测试AI生成功能
3. **创建场景** - 测试场景编辑器
4. **运行模拟** - 测试模拟引擎

## 常见问题

### 后端启动失败
检查 `.env` 文件中的 API 密钥是否正确配置

### 前端构建失败
```bash
cd apps/web
npm run build
```

### 端口被占用
修改 `.env` 中的 PORT 变量，或关闭占用端口的程序

## 生产部署

生产环境建议使用 Docker Compose：

```bash
# 安装 Docker Desktop
# https://www.docker.com/products/docker-desktop

# 然后执行
docker-compose up -d
```

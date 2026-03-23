# Website Collection Backend (MySQL)

这是网站集合项目的MySQL后端服务。

## 项目结构

```
backend/
├── server.js           # 主服务器文件
├── package.json        # 依赖配置
├── Dockerfile          # Docker镜像构建文件
├── docker-compose.yml  # Docker Compose配置
├── init.sql           # 数据库初始化脚本
├── database/
│   └── connection.js  # MySQL连接配置
└── .env.example       # 环境变量示例
```

## 快速开始

### 1. 初始化数据库

在MySQL中执行以下SQL脚本：

```bash
mysql -u root -p < init.sql
```

或者手动执行 `init.sql` 文件中的内容。

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并修改配置：

```bash
cp .env.example .env
```

修改 `.env` 文件：

```
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=website_collection
```

### 3. 安装依赖并运行

```bash
npm install
npm start
```

### 4. 使用Docker运行

```bash
# 构建并运行
docker-compose up -d

# 查看日志
docker-compose logs -f
```

## API接口

### 健康检查
- **GET** `/api/health`
- 返回: `{ "status": "ok", "timestamp": "..." }`

### 获取所有网站
- **GET** `/api/websites`
- 返回: 按分类分组的网站数据

### 添加网站
- **POST** `/api/websites`
- Body: `{ "category": "分类名", "website": { "name": "网站名", "url": "网址", "description": "描述", "icon": "图标" } }`

### 删除网站
- **DELETE** `/api/websites`
- Body: `{ "category": "分类名", "url": "网址" }` 或 `{ "category": "分类名", "name": "网站名" }`

### 初始化数据
- **POST** `/api/seed`
- Body: `{ "data": { "分类1": [...], "分类2": [...] } }`

## 部署到1Panel

### 1. 在1Panel中创建MySQL数据库

1. 登录1Panel管理界面
2. 找到"数据库"或"MySQL"选项
3. 创建新数据库 `website_collection`
4. 执行 `init.sql` 脚本

### 2. 部署后端服务

#### 方法1：使用Docker Compose

1. 将 `backend` 目录上传到NAS
2. 修改 `docker-compose.yml` 中的数据库连接信息
3. 在1Panel的Docker管理中运行 `docker-compose up -d`

#### 方法2：使用1Panel的应用商店

1. 在1Panel中找到"应用商店"
2. 选择"Node.js"应用
3. 上传 `backend` 目录
4. 配置环境变量
5. 启动应用

### 3. 配置前端

在前端项目根目录创建 `.env` 文件：

```
VITE_API_BASE_URL=http://100.72.34.82:3000/api
```

重新构建前端：

```bash
npm run build
```

### 4. 部署前端

使用Nginx容器部署前端：

```yaml
version: '3'
services:
  nginx-web:
    image: nginx:latest
    container_name: my-website
    ports:
      - "8080:80"
    volumes:
      - /docker/my_website/html:/usr/share/nginx/html:rw
    restart: always
    user: "0:0"
```

## 注意事项

1. 确保MySQL服务已启动并可访问
2. 确保数据库用户有足够的权限
3. 确保防火墙允许访问3000端口（后端）和8080端口（前端）
4. 生产环境建议修改默认密码和端口

## 故障排查

### 后端无法连接数据库
- 检查数据库连接信息是否正确
- 检查数据库服务是否启动
- 检查防火墙设置

### 前端无法访问后端
- 检查后端服务是否启动
- 检查CORS配置
- 检查API地址是否正确

### 403 Forbidden错误
- 检查Nginx配置
- 检查文件权限
- 检查用户权限设置

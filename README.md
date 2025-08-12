# FastGo - 文件快速分享系统

FastGo 是一个基于 VSCode 插件的文件分享系统，通过 VSCode 资源管理器右键菜单，可以轻松创建文件下载链接和文件上传链接。系统采用容器化架构，支持公网访问，提供多种精美的下载和上传模板。

## 🚀 快速部署

### 必备条件
- VSCode 插件安装 FastGo 插件
- 一台公网服务器已安装 （已安装 Docker）
- 一台本地电脑 （已安装 Docker）

### 1. 服务器端拉取并运行 Docker 容器

在具备公网 IP 的服务器上运行：

```bash
docker run --restart=always --network host -d --name fastgo_s \
  -e TOKEN=fastgo \
  ailuntz/fastgo_s:latest
```

**环境变量说明：**
- `TOKEN`: 身份验证 token，需与客户端端一致（默认：fastgo）

### 2. 客户端拉取并运行 Docker 容器

在本地机器上运行：

```bash
docker run -d --restart=always \
  -v /Volumes/usb_main/usb_main:/app/fastgo \
  -e SERVER_ADDR=your.server.ip \
  -e REMOTE_PORT=8409 \
  -e TOKEN=fastgo \
  --name fastgo_c \
  ailuntz/fastgo_c:latest
```

**重要参数说明：**
- `-v /Volumes/usb_main/usb_main`：用作分享及其上传的路径，插件中会使用此路径作为前缀
- `SERVER_ADDR`: 替换为你的服务器 IP 地址或域名
- `REMOTE_PORT`: 公网访问端口（默认 8409）
- `TOKEN`: 身份验证 token，需与服务器端一致（默认：fastgo）

### 3. 从 VSCode 下载插件 FastGo
```
  在 VSCode 中搜索并安装 FastGo 插件
```

### 4. 配置 FastGo 插件

插件安装后需要配置两个关键参数（第一次创建分享或者上传链接会有提示）：

1. **服务器地址 (fastgo.baseUrl)**
   - 服务器的地址或域名
   - 格式：`http://your.server.ip:8409`
   - 例如：`182.98.98.101:8409`

2. **路径前缀 (fastgo.pathPrefix)**  
   - 客户端挂载进 Docker 的前缀路径
   - 例如：`/Volumes/usb_main/usb_main`（对应 Docker 挂载命令中的前缀）

**重要说明**：只有 VSCode 挂载进 Docker 的部分文件夹，在资源管理器树中右键时才会出现分享和上传链接选项。


## 📖 使用方法

### 创建下载链接

1. 在 VSCode 资源管理器中右键选择文件或文件夹
2. 选择"创建下载链接"
3. 配置参数：
   - **最大下载次数**：限制下载次数（默认 3 次）
   - **过期时间**：链接有效期（默认 24 小时）
   - **模板样式**：选择界面模板
4. 获得分享链接，他人可通过浏览器下载

![下载页面演示](images/download_pagetest.gif)

**模板样式展示** - 系统提供多种精美的下载页面模板：

![下载模板样式](images/download_template.gif)

### 创建上传链接

1. 在 VSCode 资源管理器中右键选择文件夹
2. 选择"创建上传链接"
3. 配置参数：
   - **过期时间**：链接有效期（默认 24 小时）
   - **存储容量**：最大上传容量（默认 2GB）
   - **模板样式**：选择界面模板
4. 获得上传链接，他人可通过浏览器上传文件

![上传页面演示](images/upload_pagetest.gif)

**模板样式展示** - 系统提供多种精美的上传页面模板：

![上传模板样式](images/upload_template.gif)


## ✨ 功能特性

### VSCode 插件功能
- 📂 **资源管理器集成**：在资源管理器中右键文件/文件夹，直接创建分享链接
- 🔗 **下载链接生成**：为文件或文件夹创建临时下载链接（文件夹会自动打包为 ZIP）
- 📤 **上传链接生成**：为目录创建上传链接，允许他人向该目录上传文件
- ⚙️ **灵活配置**：支持设置服务器地址、路径映射等配置
- 🎨 **多种模板**：提供 11 种精美的界面模板供选择
- 🌍 **多语言支持**：支持中文和英文界面

### 网页端功能
- 🎯 **直观界面**：每个分享链接都有独立的精美下载/上传页面
- ⚡ **分片上传**：支持大文件分片上传，断点续传
- 📊 **实时进度**：上传下载进度实时显示
- 🔒 **安全控制**：支持下载次数限制、时间过期控制
- 💾 **存储管理**：上传链接支持存储容量限制

## 🏗️ 系统架构

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   VSCode 插件   │────│   fastgo-c 客户端  │────│  fastgo-s 服务器 │
│   (本地使用)    │    │    (本地容器)     │    │   (公网服务器)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

- **fastgo-s (服务器端)**：运行在具备公网 IP 的服务器上，作为反向代理服务器
- **fastgo-c (客户端)**：运行在本地，包含 Web 后端、前端界面和反向代理客户端
- **VSCode 插件**：提供便捷的右键菜单操作，与 fastgo-c 通信

## 🎨 模板样式

系统提供 11 种精美的界面模板：

| 模板ID | 模板名称 | 风格描述 |
|--------|----------|----------|
| 0 | Default | 简约默认风格 |
| 1 | Mihoyo | 米哈游游戏风格 |
| 2 | Steam | Steam 平台风格 |
| 3 | Hacker | 黑客终端风格 |
| 4 | Apple | 苹果设计风格 |
| 5 | Cyberpunk | 赛博朋克风格 |
| 6 | Galaxy | 星空银河风格 |
| 7 | Matrix | 黑客帝国风格 |
| 8 | Neon | 霓虹灯光风格 |
| 9 | Corporate | 企业商务风格 |
| 10 | Retro | 复古怀旧风格 |


## 🛠️ 开发调试

### 前端开发

```bash
cd fastgo
npm install
npm run dev  # 开发服务器运行在 http://localhost:4000
npm run build  # 构建生产版本
```

### 后端开发

```bash
cd app
pip install -r requirements.txt
python fastapi_app.py  # 开发服务器运行在 http://localhost:8080
```

### VSCode 插件开发

```bash
cd vscode_extension/fastgo
npm install
npm run compile  # 编译 TypeScript
npm run watch   # 监听文件变化自动编译
```

## 🔧 技术栈

- **前端**：Vue 3 + TypeScript + Vite
- **后端**：FastAPI + Python
- **反向代理**：FRP (Fast Reverse Proxy)
- **容器化**：Docker + Docker Compose
- **VSCode 插件**：TypeScript + VSCode Extension API

## 📦 项目结构

```
├── app/                    # 后端代码
│   ├── fastapi_app.py     # FastAPI 主应用
│   ├── storage.py         # 存储管理
│   ├── config.py         # 配置文件
│   └── utils.py          # 工具函数
├── fastgo/               # 前端代码
│   ├── src/
│   │   ├── components/   # Vue 组件（包含各种模板）
│   │   ├── pages/       # 页面组件
│   │   └── api/         # API 接口
│   └── dist/           # 构建输出
├── vscode_extension/     # VSCode 插件
│   └── helloworld/
│       ├── src/
│       │   ├── extension.ts  # 插件主逻辑
│       │   └── i18n/        # 国际化支持
│       └── package.json     # 插件配置
├── Dockerfile.fastgo-c   # 客户端容器
├── Dockerfile.fastgo-s   # 服务器容器
├── fastgo-c.toml.template        # FRP 客户端配置
├── fastgo-s.toml        # FRP 服务器配置
└── nginx.conf           # Nginx 配置
```

## 🔒 安全特性

- **访问控制**：所有分享链接都有唯一 token，无法枚举
- **时间限制**：支持链接过期时间设置
- **次数限制**：下载链接可限制最大下载次数
- **容量限制**：上传链接可限制最大存储容量
- **路径校验**：严格的路径验证，防止目录遍历攻击

## 📋 待办事项

- [ ] 添加文件预览功能
- [ ] 支持批量操作
- [ ] 添加访问统计
- [ ] 支持自定义域名
- [ ] 添加用户认证系统

## 🤝 贡献

欢迎提交 Issue 和 Pull Request 来改进项目！

## 📄 许可证

本项目采用 MIT 许可证开源。
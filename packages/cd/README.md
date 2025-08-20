# CD CLI - 简易部署工具

一个简易的部署工具，支持版本管理和零停机部署。

## 功能特性

- 🚀 一键部署：本地构建 → 压缩 → 上传 → 解压 → 重启服务
- 📦 版本管理：支持版本号管理，保留多个历史版本
- 🔄 零停机部署：使用软链接实现原子性切换
- ⏪ 快速回滚：一键回滚到任意历史版本
- 📝 版本列表：查看服务器上所有已部署版本
- 🔒 安全连接：支持密码和私钥认证
- 🔄 PM2 集成：自动重启 PM2 应用
- 📝 配置灵活：支持部署前后执行自定义命令
- 🎯 文件过滤：支持排除不需要的文件

## 安装

### 全局安装

```bash
npm install -g @noahyu/cd-cli
```

安装后可在任何项目中使用 `pcli-cd` 命令。

## 快速开始

### 1. 在项目中初始化配置

```bash
cd your-project
pcli-cd init
```

这会在项目根目录创建 `pcli-cd.config.js` 配置文件。

- **重要** `pcli-cd.config.js` 文件不应该提交到 Git

### 2. 部署项目

```bash
pcli-cd deploy
# 或者使用别名
pcli-cd cd

# 指定版本号部署
pcli-cd deploy --version v1.0.0
```

### 3. 查看版本列表

```bash
pcli-cd list
# 或者使用别名
pcli-cd ls
```

### 4. 回滚到指定版本

```bash
pcli-cd rollback
# 或者使用别名
pcli-cd rb

# 直接指定版本回滚
pcli-cd rollback --version v1.0.0
```

## 部署架构

部署后的服务器目录结构：

```
/var/www/your-app/
├── .output -> .output-v1.0.1     # 软链接指向当前版本
├── .output-v1.0.0/               # 历史版本
├── .output-v1.0.1/               # 当前版本
│   └── server/
│       └── index.mjs             # PM2 启动文件
└── .output-v1.0.2/               # 新版本 (如果有)
```

PM2 配置始终指向软链接 `.output/server/index.mjs`，这样切换版本时无需修改 PM2 配置。

## 配置文件

配置文件 `pcli-cd.config.js` 示例：

> **重要** `pcli-cd.config.js` 文件不应该提交到 Git

```javascript
// pcli-cd 部署配置文件
export default {
  // 构建命令 (可选)
  buildCommand: 'npm run build',

  // 构建输出目录
  buildDir: '.output',

  // 版本号 (可选，不指定会在部署时询问)
  version: 'v1.0.0',

  // 服务器配置
  server: {
    host: '192.168.1.100',
    port: 22,
    username: 'root',
    password: 'your-password', // 密码或私钥二选一
    // privateKey: '/path/to/private/key',
    deployPath: '/var/www/your-app',
  },

  // PM2 配置 (可选)
  pm2: {
    appName: 'your-app-name',
    restart: true,
  },

  // 排除的文件 (可选) - 作用于构建产物目录
  // 请根据构建输出的实际内容谨慎配置
  excludeFiles: [
    // '**/*.map',        // Source Map 文件
    // '**/.DS_Store',    // macOS 系统文件
    // '**/Thumbs.db'     // Windows 缩略图缓存
  ],

  // 部署前命令 (可选)
  beforeDeploy: ['npm run test'],

  // 部署后命令 (可选)
  afterDeploy: ['npm install --production'],
}
```

## 配置选项

| 选项                | 类型     | 必填 | 说明                             |
| ------------------- | -------- | ---- | -------------------------------- |
| `buildCommand`      | string   | 否   | 构建命令，如 "npm run build"     |
| `buildDir`          | string   | 是   | 构建输出目录，如 ".output"       |
| `version`           | string   | 否   | 版本号，不指定会在部署时询问     |
| `server.host`       | string   | 是   | 服务器地址                       |
| `server.port`       | number   | 否   | SSH 端口，默认 22                |
| `server.username`   | string   | 是   | 用户名                           |
| `server.password`   | string   | 否   | 密码                             |
| `server.privateKey` | string   | 否   | 私钥路径                         |
| `server.deployPath` | string   | 是   | 服务器部署路径                   |
| `pm2.appName`       | string   | 否   | PM2 应用名称                     |
| `pm2.restart`       | boolean  | 否   | 是否重启 PM2 应用                |
| `excludeFiles`      | string[] | 否   | 排除的文件模式（相对于构建目录） |
| `beforeDeploy`      | string[] | 否   | 部署前执行的命令                 |
| `afterDeploy`       | string[] | 否   | 部署后执行的命令                 |

## 命令详解

### deploy (cd)

部署项目到服务器

```bash
pcli-cd deploy [options]

Options:
  -c, --config <config>    配置文件路径 (默认: ./pcli-cd.config.js)
  -v, --version <version>  指定版本号
  -h, --help              显示帮助信息
```

### list (ls)

列出服务器上的所有版本

```bash
pcli-cd list [options]

Options:
  -c, --config <config>    配置文件路径 (默认: ./pcli-cd.config.js)
  -h, --help              显示帮助信息
```

### rollback (rb)

回滚到指定版本

```bash
pcli-cd rollback [options]

Options:
  -c, --config <config>    配置文件路径 (默认: ./pcli-cd.config.js)
  -v, --version <version>  回滚到的版本号
  -h, --help              显示帮助信息
```

### init

初始化配置文件

```bash
pcli-cd init
```

## 使用场景

### 1. Nuxt 3 项目部署

```javascript
// Nuxt.js 项目配置
export default {
  buildCommand: 'npm run build',
  buildDir: '.output',
  server: {
    host: 'your-server.com',
    username: 'root',
    password: 'your-password',
    deployPath: '/var/www/nuxt-app',
  },
  pm2: {
    appName: 'nuxt-app',
    restart: true,
  },
  excludeFiles: [
    // 注意：以下路径相对于 .output 目录
    // 请根据实际构建产物内容调整
    'src/**', // 如果源码被复制到输出目录
    '**/.DS_Store', // macOS 系统文件
  ],
}
```

### 2. Node.js API 项目部署

```javascript
// Node.js API 项目配置
export default {
  buildCommand: 'npm run build',
  buildDir: 'dist',
  server: {
    host: 'your-server.com',
    username: 'root',
    privateKey: '~/.ssh/id_rsa',
    deployPath: '/var/www/api'
  },
  pm2: {
    appName: 'api-server',
    restart: true
  },
  excludeFiles: [
    // 注意：以下路径相对于 dist 目录
    // 请根据实际构建产物内容调整
    'src/**',         // 如果源码被复制到输出目录
    '**/.DS_Store', // macOS 系统文件
  ]
  afterDeploy: [
    'npm install --production'
  ]
}
```

## excludeFiles 配置说明

⚠️ **重要提醒**：`excludeFiles` 作用于**构建产物目录**（如 `dist/`、`.output/` 等），不是项目根目录。

### 工作原理

1. 首先执行 `buildCommand` 生成构建产物到 `buildDir`
2. 然后对 `buildDir` 目录进行压缩，此时应用 `excludeFiles` 规则
3. 将压缩包上传到服务器

### 配置建议

```javascript
// ❌ 错误理解：认为排除的是项目根目录文件
export default {
  excludeFiles: ['src/**', 'node_modules/**']
}

// ✅ 正确理解：排除的是构建目录内的文件
export default {
  excludeFiles: [
    // 只有当这些文件确实出现在构建目录中，且确认不需要时才排除
    '**/*.map',        // Source Map 文件（通常不需要）
    '**/.DS_Store',    // macOS 系统文件
    '**/Thumbs.db'     // Windows 缩略图缓存
  ]
}
```

### 注意事项

- **运行时依赖**：某些框架（如 Nuxt、Next.js）的构建产物可能包含必需的 `node_modules`
- **建议**：初次使用时保持 `excludeFiles: []`，观察构建产物内容后再配置

## 版本管理

### 零停机部署流程

1. 构建项目到本地 `.output` 目录
2. 压缩并上传到服务器的新版本目录 `.output-v1.0.1`
3. 在新版本目录执行部署后命令（如安装依赖）
4. 原子性切换软链接 `.output` 指向新版本目录
5. 重启 PM2 应用
6. 清理旧版本（保留最近3个版本）

### 版本命名规则

- 自动生成：`v20250820-114530`（基于时间戳）
- 手动指定：`v1.0.0`、`v2.1.3` 等
- 版本号可以是任意字符串，建议使用语义化版本

### 回滚机制

回滚只需要切换软链接指向，无需重新上传文件，速度极快：

```bash
# 查看所有版本
pcli-cd list

# 回滚到指定版本
pcli-cd rollback --version v1.0.0

# 交互式选择版本回滚
pcli-cd rollback
```

## 配置文件

每个项目只需要一个 `pcli-cd.config.js` 配置文件，工具会自动读取当前目录下的配置。

⚠️ **重要提醒** `pcli-cd.config.js` 文件不应该提交到 Git

## 注意事项

- **全局安装后首次使用**：安装后可在任意目录使用 `pcli-cd` 命令
- **配置文件位置**：每个项目根目录需要有 `pcli-cd.config.js` 配置文件
- 确保服务器已安装 `unzip` 命令
- 如果使用 PM2，确保服务器已安装 PM2
- 私钥文件需要有正确的权限 (600)
- 建议在生产环境使用私钥认证而非密码
- PM2 配置文件中的启动路径应该指向软链接而非具体版本目录
- 部署过程中会自动清理旧版本，默认保留最近3个版本

## 故障排除

### 找不到 pcli-cd 命令

```bash
# 检查是否正确安装
npm list -g @noahyu/cd-cli

# 重新安装
npm install -g @noahyu/cd-cli
```

### 配置文件错误

```bash
# 检查配置文件是否存在
ls pcli-cd.config.js

# 重新初始化配置
pcli-cd init
```

## License

MIT

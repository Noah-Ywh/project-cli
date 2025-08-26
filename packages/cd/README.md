# 简易的项目部署工具

> 一个简易的部署工具，支持版本管理和零停机部署。

## 功能特性

- 🚀 一键部署：本地构建 → 压缩 → 上传 → 解压 → 重启服务
- 📦 版本管理：支持版本号管理，保留多个历史版本
- 🔄 零停机部署：使用软链接实现原子性切换
- ⏪ 快速回滚：一键回滚到任意历史版本
- 📝 版本列表：查看服务器上所有已部署版本
- 🔒 SSH 认证：支持密码、密钥
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

> [!WARNING]
> `pcli-cd.config.js` 配置文件存在敏感信息，不应该提交到 Git

#### 配置选项

| 选项                    | 类型     | 必填 | 说明                             |
| ----------------------- | -------- | ---- | -------------------------------- |
| `name`                  | string   | 是   | 环境名称                         |
| `buildCommand`          | string   | 否   | 构建命令，如 "npm run build"     |
| `buildDir`              | string   | 是   | 构建输出目录，如 ".output"       |
| `server.host`           | string   | 是   | 服务器地址                       |
| `server.port`           | number   | 否   | 端口，默认 22                    |
| `server.username`       | string   | 是   | 用户名                           |
| `server.privateKey`     | string   | 否   | 私钥内容，优先级最高             |
| `server.privateKeyPath` | string   | 否   | 私钥文件路径                     |
| `server.password`       | string   | 否   | 密码                             |
| `server.deployPath`     | string   | 是   | 服务器部署路径                   |
| `pm2.appName`           | string   | 否   | PM2 应用名称                     |
| `pm2.restart`           | boolean  | 否   | 是否重启 PM2 应用                |
| `excludeFiles`          | string[] | 否   | 排除的文件模式（相对于构建目录） |
| `beforeDeploy`          | string[] | 否   | 部署前执行的命令                 |
| `afterDeploy`           | string[] | 否   | 部署后执行的命令                 |

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

> [!WARNING]
> `pcli-cd.config.js` 配置文件存在敏感信息，不应该提交到 Git

```javascript
// pcli-cd 部署配置文件
export default {
  apps: [
    {
      name: 'prod',
      /** 构建命令 (可选)：构建项目 */
      buildCommand: 'npm run build',
      /** 构建输出目录 */
      buildDir: '.output',
      /** 版本号 (可选，不指定会在部署时询问) */
      version: 'v1.0.0',
      /** 服务器配置 */
      server: {
        /** 服务器地址 */
        host: '192.168.1.100',
        /** 端口号 */
        port: 22,
        /** 用户名 */
        username: 'root',
        /** SSH 认证方式（优先级：privateKey > privateKeyPath > password） */
        privateKey: '-----BEGIN OPENSSH PRIVATE KEY-----\n...\n-----END OPENSSH PRIVATE KEY-----', // 私钥
        privateKeyPath: '/home/user/.ssh/id_rsa', // 私钥文件路径
        password: 'your-password', // 密码
        /** 部署目录 */
        deployPath: '/var/www/your-app',
      },
      /** PM2 配置 (可选) */
      pm2: {
        /** 进程名称 */
        appName: 'your-app-name',
        /** 是否立即重启 */
        restart: true,
      },

      /**
       * 排除的文件 (可选) - 作用于构建产物目录
       *
       * 请根据构建输出的实际内容谨慎配置
       */
      excludeFiles: [
        // '**/*.map',        // Source Map 文件
        // '**/.DS_Store',    // macOS 系统文件
        // '**/Thumbs.db'     // Windows 缩略图缓存
      ],
      /** 部署前命令 (可选) */
      beforeDeploy: ['npm run test'],
      /** 部署后命令 (可选) */
      afterDeploy: ['npm install --production'],
    },
  ],
}
```

## SSH 认证配置

工具支持三种 SSH 认证方式，优先级为：`privateKey` > `privateKeyPath` > `password`

### 方式一：私钥内容（推荐用于 CI/CD）

适用于 CI/CD 环境，将私钥内容作为环境变量传入：

```javascript
export default {
  apps: [
    {
      name: 'prod',
      server: {
        host: '192.168.1.100',
        username: 'root',
        privateKey: process.env.SSH_PRIVATE_KEY, // 从环境变量读取
        deployPath: '/var/www/app',
      },
      // ···
    },
  ],
}
```

### 方式二：私钥文件路径（推荐用于本地开发）

适用于本地开发环境，使用本地私钥文件：

```javascript
export default {
  apps: [
    {
      name: 'dev',
      server: {
        host: '192.168.1.100',
        username: 'root',
        privateKeyPath: '/home/user/.ssh/id_rsa',
        deployPath: '/var/www/app',
      },
      // ···
    },
  ],
}
```

### 方式三：密码认证

适用于简单测试环境（生产环境不推荐）：

```javascript
export default {
  apps: [
    {
      name: 'test',
      server: {
        host: '192.168.1.100',
        username: 'root',
        password: 'your-password',
        deployPath: '/var/www/app',
      },
      // ···
    },
  ],
}
```

### 优先级说明

当配置了多种认证方式时，工具会按以下优先级选择：

1. **privateKey**（私钥内容）- 最高优先级
2. **privateKeyPath**（私钥文件路径）- 中等优先级
3. **password**（密码）- 最低优先级

### 安全建议

- ✅ **生产环境**：使用私钥认证（`privateKey` 或 `privateKeyPath`）
- ✅ **CI/CD**：使用 `privateKey` + 环境变量
- ✅ **本地开发**：使用 `privateKeyPath`
- ⚠️ **测试环境**：可以使用密码认证
- ❌ **避免**：在配置文件中硬编码密码或私钥内容

## 命令详解

### deploy (cd)

部署项目到服务器

```bash
pcli-cd deploy [options]

Options:
  -c, --config <config>    配置文件路径 (默认: ./pcli-cd.config.js)
  -n, --name <name>        指定环境名称
  -v, --version <version>  指定版本号
  -h, --help              显示帮助信息
```

### list (ls)

列出服务器上的所有版本

```bash
pcli-cd list [options]

Options:
  -c, --config <config>    配置文件路径 (默认: ./pcli-cd.config.js)
  -n, --name <name>        指定环境名称
  -h, --help              显示帮助信息
```

### rollback (rb)

回滚到指定版本

```bash
pcli-cd rollback [options]

Options:
  -c, --config <config>    配置文件路径 (默认: ./pcli-cd.config.js)
  -n, --name <name>        指定环境名称
  -v, --version <version>  回滚到的版本号
  -h, --help              显示帮助信息
```

### init

初始化配置文件

```bash
pcli-cd init
```

## excludeFiles 配置说明

⚠️ **重要提醒**：`excludeFiles` 作用于**构建产物目录**（如 `dist/`、`.output/` 等），不是项目根目录。

### 工作原理

1. 首先执行 `buildCommand` 生成构建产物到 `buildDir`
2. 然后对 `buildDir` 目录进行压缩，此时应用 `excludeFiles` 规则
3. 将压缩包上传到服务器

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

> [!WARNING]
> `pcli-cd.config.js` 配置文件存在敏感信息，不应该提交到 Git

## 注意事项

- **全局安装后首次使用**：安装后可在任意目录使用 `pcli-cd` 命令
- **配置文件位置**：每个项目根目录需要有 `pcli-cd.config.js` 配置文件
- **SSH 认证**：
  - 支持 OpenSSH 格式的 RSA、ECDSA、Ed25519 私钥
  - 私钥文件需要有正确的权限 (600)
  - 生产环境建议使用私钥认证而非密码
  - CI/CD 环境推荐使用 `privateKey` + 环境变量
- **服务器要求**：
  - 确保服务器已安装 `unzip` 命令
  - 如果使用 PM2，确保服务器已安装 PM2
- **PM2 配置**：PM2 配置文件中的启动路径应该指向软链接而非具体版本目录
- **版本管理**：部署过程中会自动清理旧版本，默认保留最近3个版本

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

### SSH 连接失败

**1. 私钥文件不存在**

```bash
# 检查私钥文件是否存在
ls -la /home/user/.ssh/id_rsa

# 检查私钥文件权限
chmod 600 /home/user/.ssh/id_rsa
```

**2. 私钥格式错误**

```bash
# 检查私钥格式（应该以此开头）
head -1 /home/user/.ssh/id_rsa
# RSA: -----BEGIN RSA PRIVATE KEY-----
# OpenSSH: -----BEGIN OPENSSH PRIVATE KEY-----
# ECDSA: -----BEGIN EC PRIVATE KEY-----
```

**3. SSH 认证配置问题**

- 确保至少配置了 `password`、`privateKey` 或 `privateKeyPath` 之一
- 检查私钥文件路径是否正确
- 验证服务器用户名和地址是否正确

**4. 网络连接问题**

```bash
# 测试 SSH 连接
ssh -p 22 root@your-server.com

# 测试指定私钥连接
ssh -i /home/user/.ssh/id_rsa -p 22 root@your-server.com
```

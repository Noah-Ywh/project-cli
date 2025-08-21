# project-cli

## 初始化项目

### 安装

```bash
npm install @noahyu/project-cli -g
```

### 快速开始

```bash
pcli create <app-name>
```

## 项目部署

### 安装

```bash
npm install @noahyu/cd-cli -g
```

### 快速开始

#### 在项目中初始化配置

```bash
cd your-project
pcli-cd init
```

这会在项目根目录创建 `pcli-cd.config.js` 配置文件。

- **重要** `pcli-cd.config.js` 文件不应该提交到 Git

#### 部署项目

```bash
pcli-cd deploy
# 或者使用别名
pcli-cd cd

# 指定版本号部署
pcli-cd deploy --version v1.0.0
```

#### 查看版本列表

```bash
pcli-cd list
# 或者使用别名
pcli-cd ls
```

#### 回滚到指定版本

```bash
pcli-cd rollback
# 或者使用别名
pcli-cd rb

# 直接指定版本回滚
pcli-cd rollback --version v1.0.0
```

## License

[MIT](https://opensource.org/licenses/MIT)

Copyright (c) 2023-present, Noah Yu

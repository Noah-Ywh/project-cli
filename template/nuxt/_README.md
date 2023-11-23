# <%= name %>

> Project CLI

## 开发环境

| 工具       | 版本       | 安装方式                    |
| ---------- | ---------- | --------------------------- |
| Node.js    | >= v20.0.0 | -                           |
| pnpm       | >= v8.6.0  | `npm install pnpm -g`       |
| commitizen | >= v4.2.0  | `npm install commitizen -g` |
| git        | >= v2.7.6  | -                           |

- 该项目必须使用 `pnpm` 作为包管理工具

## 工程目录

### 目录结构

```
<%= name %>
├── .husky ----------------------- Git 钩子
├── assets ----------------------- 公共的网站资源目录
├── components ------------------- 公共的单文件组件目录
├── composables ------------------ 公共的全局可复用组合逻辑目录
├── content ---------------------- 内容目录，Markdown 为主
├── layouts ---------------------- 公共的布局组件目录
├── middleware ------------------- 公共的中间件目录
├── pages ------------------------ 页面
├── plugins ---------------------- 公共的插件目录

├── public ----------------------- 网站静态资源目录
├── server ----------------------- 服务器目录
├── utils ------------------------ 公共的辅助函数目录
├── .cz-config.js ---------------- Git 辅助工具配置文件
├── .editorconfig ---------------- 编辑器/IDE 配置文件
├── .eslintignore ---------------- ESlint 配置文件
├── .eslintrc.js ----------------- ESlint 配置文件
├── .gitignore ------------------- Git 配置文件
├── .npmrc ----------------------- npm/pnpm 配置文件
├── .prettierrc ------------------ prettier 配置文件
├── commitlint.config.ts --------- Git 辅助工具配置文件
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── README.md
└── tsconfig.json
```

## 开发规范

### 目录/文件命名规范

- 全小写字母，使用中横线 `-` 分词

- `components` 目录下私有的单文件组件命名方式与 [官方推荐](https://nuxt.com/docs/guide/directory-structure/components#component-names) 的相同

  ```
  > | components/
  > --| base/
  > ----| foo/
  > ------| base-foo-button.vue
  ```

  组件名称为：`<BaseFooButton />`

### Git 规范

为了得到引导式的提交步骤，务必全局安装 `commitizen`

```bash
npm install commitizen -g
```

安装之后使用 `git cz` 代替 `git commit`

```bash
# 把修改提交到本地缓存区
git add .

# 以引导式的方式编写 commit message
git cz
```

#### 提交规范

确保 Commit Message 描述边界清晰、功能单一，不可包含多个功能描述，不可随意描述

> 正例：feat(component): 新增产品列表接口

> 反例：feat(api): 新增产品列表组件 & 修改头部样式 & 产品经理又改需求

#### Commit Message 格式

`<type><(scopes)>:<message>`

Type

- feat：新增功能
- fix：修复缺陷
- refactor：代码重构
- perf：性能优化
- test：单元测试
- style：代码格式化
- chore：项目配置变更
- build：构建流程变更
- ci：修改 CI 配置
- revert：代码回滚
- docs：修改文档

Scopes

- asset: 网站资源
- component: 组件
- composable: 组合逻辑
- layout: 布局
- middleware: 中间件
- page: 页面
- plugin: 插件
- public: 静态资源
- util: 辅助函数

#### 分支命名规范

| 分支                 | 功能               | 描述                                                                                                                                                                                                  |
| -------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| develop              | 开发分支           | 当前版本持续开发分支,包含着当前版本的最新代码,除紧急修补外,非当前版本代码不可推送到该分支                                                                                                             |
| release              | 预发布分支         | 当前版本发布生产之前的测试分支,该分支代码来自 dev 分支,当前版本的测试环境代码与该分支同步                                                                                                             |
| main                 | 主分支             | 当前版本发布生产环境的分支,生产环境代码与该分支代码同步                                                                                                                                               |
| hotfix-dev           | 紧急修补分支       | 紧急 BUG 或紧急需求的开发分支,当发生紧急 BUG(需求)时该分支才会从 main 分支上创建出来,可存在多条,自定义'\*'名称以区分当前 BUG(需求)的功能模块,发布测试并通过后删除该分支                               |
| hotfix-release       | 紧急修补预发布分支 | 紧急 BUG(需求)修补之后发布紧急测试环境的分支,该分支代码来自紧急修补分支,测试通过后需合并到 dev 与 main 分支                                                                                           |
| feature-\*（版本号） | 前置分支           | 当开发与当前版本无关,处于下一个或超越当前版本的某一个版本的功能时,可将代码推送到该分支,定义\*名称以区分版本号,当该版本进入'当前版本'阶段,需合并到 dev 分支并删除该分支,非必要时不在远程仓库创建该分支 |

#### 统一使用 LF 换行符

在 windows 系统下，拉取代码后 Git 可能会将换行符修改为 `CRLF`

格式化代码之后一般恢复为 `LF`

最优解决方案是输入以下命令，让 Git 在 拉取/提交 过程中不修改换行符

```bash
git config --global core.autocrlf false
```

## 相关命令

```bash
# 初始化项目
$ pnpm install

# 启动开发服务
$ pnpm dev
```

// .commitlintrc.js
/** @type {import('cz-git').UserConfig} */
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // @see: https://commitlint.js.org/#/reference-rules
  },
  prompt: {
    messages: {
      type: '选择本次提交的类型:',
      scope: '选择本次更改影响的范围:',
      customScope: '输入自定义影响范围:',
      subject: '输入本次修改的描述:\n',
      body: '输入本次修改的详细描述,使用"|"换行:\n',
      breaking: '列出重大更改:\n',
      footerPrefixesSelect: '选择关联issue前缀:',
      customFooterPrefix: '输入自定义issue前缀:',
      footer: '列举关联的issue:\n',
      generatingByAI: '正在通过 AI 生成 commit...',
      generatedSelectByAI: '选择一个 AI 生成的 commit:',
      confirmCommit: '确认提交?',
    },

    types: [
      {
        value: 'feat',
        name: 'feat:     ✨  新增功能',
        emoji: ':sparkles:',
      },
      {
        value: 'fix',
        name: 'fix:      🐛  修复缺陷',
        emoji: ':bug:',
      },
      {
        value: 'docs',
        name: 'docs:     📝  更新文档',
        emoji: ':memo:',
      },
      {
        value: 'style',
        name: 'style:    💄  代码风格',
        emoji: ':lipstick:',
      },
      {
        value: 'refactor',
        name: 'refactor: ♻️  代码重构',
        emoji: ':recycle:',
      },
      {
        value: 'perf',
        name: 'perf:     ⚡️ 性能提升',
        emoji: ':zap:',
      },
      {
        value: 'test',
        name: 'test:     ✅  单元测试',
        emoji: ':white_check_mark:',
      },
      {
        value: 'build',
        name: 'build:    📦️ 构建相关',
        emoji: ':package:',
      },
      {
        value: 'ci',
        name: 'ci:       🎡  持续集成',
        emoji: ':ferris_wheel:',
      },
      {
        value: 'chore',
        name: 'chore:    🔨  更新配置',
        emoji: ':hammer:',
      },
      {
        value: 'revert',
        name: 'revert:   ⏪️ 回退代码',
        emoji: ':rewind:',
      },
    ],
    typesSearchValue: false,

    useEmoji: false,
    emojiAlign: 'center',

    scopesSearchValue: false,
    customScopesAlign: 'bottom',
    customScopesAlias: 'custom',
    emptyScopesAlias: 'empty',
    enableMultipleScopes: false,
    allowCustomScopes: true,
    allowEmptyScopes: true,
    scopes: [],
    scopeOverrides: {
      feat: [
        { name: 'component' },
        { name: 'composable' },
        { name: 'layout' },
        { name: 'middleware' },
        { name: 'page' },
        { name: 'plugin' },
        { name: 'util' },
      ],
      fix: [
        { name: 'component' },
        { name: 'composable' },
        { name: 'layout' },
        { name: 'middleware' },
        { name: 'page' },
        { name: 'plugin' },
        { name: 'util' },
      ],
    },

    customIssuePrefixAlign: 'top',
    customIssuePrefixAlias: 'custom',
    emptyIssuePrefixAlias: 'skip',
    allowCustomIssuePrefix: true,
    allowEmptyIssuePrefix: true,
    issuePrefixes: [{ value: 'closed', name: 'closed:   ISSUES has been processed' }],

    themeColorCode: '',
    confirmColorize: true,

    markBreakingChangeMode: false,
    allowBreakingChanges: ['feat', 'fix', 'refactor'],

    upperCaseSubject: false,

    maxHeaderLength: Infinity,
    maxSubjectLength: Infinity,
    minSubjectLength: 0,

    breaklineNumber: 100,
    breaklineChar: '|',

    useAI: false,
    aiNumber: 1,

    skipQuestions: [],

    defaultBody: '',
    defaultIssues: '',
    defaultScope: '',
    defaultSubject: '',
  },
}

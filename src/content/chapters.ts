import { lazy, type ComponentType } from 'react'

export interface Chapter {
  /** URL slug, e.g. "ownership" → /learn/ownership */
  slug: string
  /** 章节标题 */
  title: string
  /** 一句话副标题 */
  subtitle: string
  /** 侧栏分组 */
  group: string
  /** 预计阅读分钟 */
  minutes: number
  /** emoji 图标 */
  icon: string
  /** 懒加载的章节组件 */
  Component: ComponentType
}

/**
 * 课程大纲 —— 以「前端工程师」为读者画像组织。
 * 顺序即学习路径,侧栏与上一章/下一章导航都从这里派生。
 */
export const chapters: Chapter[] = [
  {
    slug: 'why-rust',
    title: '为什么前端要学 Rust',
    subtitle: '从 JS 引擎、构建工具到 Wasm,Rust 早已在你身边',
    group: '起步',
    minutes: 10,
    icon: '🧭',
    Component: lazy(() => import('./chapters/WhyRust')),
  },
  {
    slug: 'setup',
    title: '安装工具链 · cargo vs npm',
    subtitle: 'rustup / cargo / crates.io,用 npm 的心智一一对应',
    group: '起步',
    minutes: 9,
    icon: '🛠️',
    Component: lazy(() => import('./chapters/Setup')),
  },
  {
    slug: 'syntax',
    title: '基础语法速通',
    subtitle: '变量、类型、函数、控制流 —— 和 TS 比着学',
    group: '语言核心',
    minutes: 16,
    icon: '📝',
    Component: lazy(() => import('./chapters/Syntax')),
  },
  {
    slug: 'ownership',
    title: '所有权 · Rust 的灵魂',
    subtitle: '没有 GC 也没有手动 free,可视化看清 move 与 drop',
    group: '语言核心',
    minutes: 20,
    icon: '🔑',
    Component: lazy(() => import('./chapters/Ownership')),
  },
  {
    slug: 'borrowing',
    title: '借用与引用 · 借用检查器',
    subtitle: '& 与 &mut,编译期就杜绝数据竞争',
    group: '语言核心',
    minutes: 18,
    icon: '🤝',
    Component: lazy(() => import('./chapters/Borrowing')),
  },
  {
    slug: 'structs-enums',
    title: '结构体 · 枚举 · 模式匹配',
    subtitle: 'interface/union 的强化版,match 比 switch 香',
    group: '语言核心',
    minutes: 16,
    icon: '🧩',
    Component: lazy(() => import('./chapters/StructsEnums')),
  },
  {
    slug: 'error-handling',
    title: '错误处理 · Result 与 Option',
    subtitle: '告别 try/catch 与 undefined,错误是值',
    group: '语言核心',
    minutes: 15,
    icon: '🚦',
    Component: lazy(() => import('./chapters/ErrorHandling')),
  },
  {
    slug: 'traits-generics',
    title: 'Trait 与泛型',
    subtitle: 'interface + 类型类,零成本抽象',
    group: '语言核心',
    minutes: 17,
    icon: '🧬',
    Component: lazy(() => import('./chapters/TraitsGenerics')),
  },
  {
    slug: 'closures',
    title: '闭包 · Fn / FnMut / FnOnce',
    subtitle: '箭头函数你天天写,这次看清它「捕获」了什么',
    group: '语言核心',
    minutes: 16,
    icon: '🎯',
    Component: lazy(() => import('./chapters/Closures')),
  },
  {
    slug: 'iterators',
    title: '集合与迭代器',
    subtitle: 'map/filter/reduce 你早会了,这次它们零成本',
    group: '语言核心',
    minutes: 14,
    icon: '🔁',
    Component: lazy(() => import('./chapters/Iterators')),
  },
  {
    slug: 'collections',
    title: '常用集合 · HashMap / HashSet',
    subtitle: 'Map、Set、Object 在 Rust 里长什么样',
    group: '语言核心',
    minutes: 15,
    icon: '🗂️',
    Component: lazy(() => import('./chapters/Collections')),
  },
  {
    slug: 'smart-pointers',
    title: '智能指针 · Box / Rc / RefCell',
    subtitle: '当所有权不够用:共享、递归与内部可变性',
    group: '进阶',
    minutes: 19,
    icon: '📦',
    Component: lazy(() => import('./chapters/SmartPointers')),
  },
  {
    slug: 'lifetimes',
    title: '生命周期进阶',
    subtitle: '看懂 &\'a,理解引用「能活多久」的契约',
    group: '进阶',
    minutes: 16,
    icon: '⏳',
    Component: lazy(() => import('./chapters/Lifetimes')),
  },
  {
    slug: 'async',
    title: '异步与并发',
    subtitle: 'async/await 似曾相识,但没有数据竞争',
    group: '进阶',
    minutes: 15,
    icon: '⚡',
    Component: lazy(() => import('./chapters/AsyncConcurrency')),
  },
  {
    slug: 'modules',
    title: '模块系统 · 测试 · 文档',
    subtitle: 'mod / crate / workspace,以及内置测试与文档',
    group: '进阶',
    minutes: 17,
    icon: '🏗️',
    Component: lazy(() => import('./chapters/Modules')),
  },
  {
    slug: 'macros',
    title: '宏 · 元编程入门',
    subtitle: 'println! 后面那个 ! 到底是什么',
    group: '进阶',
    minutes: 14,
    icon: '🪄',
    Component: lazy(() => import('./chapters/Macros')),
  },
  {
    slug: 'wasm',
    title: 'WebAssembly · 前端的主场',
    subtitle: '把 Rust 编译进浏览器,和 JS 双向调用',
    group: '前端实战',
    minutes: 18,
    icon: '🕸️',
    Component: lazy(() => import('./chapters/Wasm')),
  },
  {
    slug: 'ecosystem',
    title: 'Rust 生态地图',
    subtitle: '常用 crate 速查:serde、tokio、axum、clap…',
    group: '前端实战',
    minutes: 13,
    icon: '🗺️',
    Component: lazy(() => import('./chapters/Ecosystem')),
  },
  {
    slug: 'showcase',
    title: '明星项目巡礼',
    subtitle: '前端有 React/Vue,Rust 的名人堂是谁',
    group: '前端实战',
    minutes: 12,
    icon: '⭐',
    Component: lazy(() => import('./chapters/Showcase')),
  },
  {
    slug: 'project',
    title: '实战 · 写一个 CLI 小工具',
    subtitle: '从零做一个 Markdown 字数统计器,跑起来',
    group: '前端实战',
    minutes: 20,
    icon: '🚀',
    Component: lazy(() => import('./chapters/Project')),
  },
]

export const chapterBySlug = (slug: string): Chapter | undefined =>
  chapters.find((c) => c.slug === slug)

export const chapterIndex = (slug: string): number =>
  chapters.findIndex((c) => c.slug === slug)

/** 按 group 聚合,供侧栏渲染 */
export function groupedChapters(): { group: string; items: Chapter[] }[] {
  const out: { group: string; items: Chapter[] }[] = []
  for (const ch of chapters) {
    let bucket = out.find((b) => b.group === ch.group)
    if (!bucket) {
      bucket = { group: ch.group, items: [] }
      out.push(bucket)
    }
    bucket.items.push(ch)
  }
  return out
}

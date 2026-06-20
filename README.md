# Rust for Frontend

Rust for JSer: 面向前端工程师的交互式 Rust 入门教程。

这门课不从「什么是变量」开始讲,而是把 Rust 的核心概念翻译成你已经熟悉的 JavaScript / TypeScript 心智模型。课程通过对照代码、交互动画、可运行示例和小练习,帮助前端工程师理解所有权、借用、生命周期、迭代器、Wasm 和 Rust 工具链。

> 适合:有 JavaScript / TypeScript 经验,想系统理解 Rust 的前端工程师。

## 课程特色

- JS / TS 与 Rust 并排对照,降低心智迁移成本。
- 用交互式 SVG 动画解释所有权、借用、闭包捕获、生命周期、迭代器等抽象概念。
- 标记为 `runnable` 的 Rust 代码块可在页面内编辑并运行,由官方 Rust Playground 云端编译执行。
- 每章配有自测题,核心章节配有 micro-lab 和编译器报错训练。
- 最后一章完成一个 Markdown 统计 CLI 小工具,串联所有权、借用、struct、Result 和迭代器。
- 关注前端相关场景:Wasm、工具链、CLI、crate 生态与核心逻辑复用。

## 课程内容

### 起步

1. 为什么前端要学 Rust
2. 安装工具链: cargo vs npm

### 语言核心

3. 基础语法速通
4. 所有权
5. 借用与引用
6. 结构体、枚举与模式匹配
7. 错误处理: Result 与 Option
8. Trait 与泛型
9. 闭包: Fn / FnMut / FnOnce
10. 集合与迭代器
11. HashMap / HashSet

### 进阶

12. 智能指针: Box / Rc / RefCell
13. 生命周期
14. 异步与并发
15. 模块系统、测试与文档
16. 宏

### 前端实战

17. WebAssembly
18. Rust 生态地图
19. 明星项目巡礼:Rust 的知名开源仓库
20. 实战:写一个 Markdown 统计 CLI 工具

## 本地运行

```bash
pnpm install
pnpm dev
```

构建生产版本:

```bash
pnpm build
pnpm preview
```

如果本机 `pnpm` 因 build-script 审批或 corepack 自检失败,可以用下面的命令做等价验证:

```bash
npx tsc -b
npx vite build
```

## 技术栈

- Vite
- React 18
- TypeScript
- React Router
- Framer Motion
- react-syntax-highlighter
- 手写 SVG 可视化
- Rust Playground execute API

## 项目结构

```txt
src/
├── main.tsx                 # 入口 + 路由
├── content/
│   ├── chapters.ts          # 章节注册表,课程大纲的单一来源
│   └── chapters/            # 20 章正文,每章一个组件
├── components/
│   ├── CodeBlock.tsx        # 代码块:高亮 / 复制 / 运行入口
│   ├── RustRunner.tsx       # 内嵌 Rust Playground 运行器
│   ├── Lab.tsx              # micro-lab 与报错训练
│   ├── Ui.tsx               # 教学原语:Callout / Compare / Quiz / Figure 等
│   └── viz/                 # 所有权、借用、生命周期、迭代器等可视化
├── lib/
│   └── playground.ts        # Rust Playground API 调用封装
├── pages/                   # Home / ChapterPage
├── hooks/                   # 学习进度
└── styles/                  # 全局样式与设计变量
```

## 添加或修改章节

1. 在 `src/content/chapters/` 新增章节组件,默认导出一个 React 组件。
2. 在 `src/content/chapters.ts` 的 `chapters` 数组里登记 `slug`、标题、分组、预计时间和懒加载组件。

侧栏、首页大纲、上一章/下一章导航和进度统计都会从 `chapters.ts` 自动派生。

## 这个项目想解决什么

Rust 的官方资料很系统,但对前端工程师来说,最难的往往不是语法,而是心智模型切换:

- 为什么赋值会让原变量失效?
- 为什么一个可变引用会排斥所有只读引用?
- 为什么 `Result` 比 `try/catch` 更显式?
- 为什么迭代器是惰性的,却仍然高性能?
- Rust 如何进入前端工具链和浏览器 Wasm 场景?

这个项目的目标是先建立这些核心直觉,再把读者带到 The Rust Book、Rustlings 和真实项目中继续深入。

## 后续计划

- 增加更多章节内 micro-lab。
- 增加更多真实 rustc 报错阅读训练。
- 把最终 CLI 项目改造成贯穿式练习。
- 补充 Rust 2024 Edition 内容。
- 增加「Rust 与现代前端工具链」专题。


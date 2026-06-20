import { Callout, Figure, Pill } from '../../components/Ui'
import Flow from '../../components/viz/Flow'
import './Showcase.css'

interface Repo {
  name: string
  /** owner/repo,用于拼 github 链接 */
  repo: string
  what: string
  /** 对应前端世界的谁 */
  like?: string
}

function RepoGrid({ repos }: { repos: Repo[] }) {
  return (
    <div className="repo-grid">
      {repos.map((r) => (
        <a
          key={r.repo}
          className="repo-card"
          href={`https://github.com/${r.repo}`}
          target="_blank"
          rel="noreferrer"
        >
          <div className="repo-top">
            <span className="repo-name">{r.name}</span>
            <span className="repo-ext">↗</span>
          </div>
          <div className="repo-path">{r.repo}</div>
          <div className="repo-what">{r.what}</div>
          {r.like && <div className="repo-like">≈ 前端的 {r.like}</div>}
        </a>
      ))}
    </div>
  )
}

export default function Showcase() {
  return (
    <>
      <p>
        前端有"家喻户晓"的项目:框架是 React / Vue,全栈是 Next.js / Nest.js,工具是 webpack / Vite。
        那 <strong>Rust 的"名人堂"是谁</strong>?这一章带你逛一圈围绕 Rust 的明星 GitHub 仓库——
        很多你<strong>已经天天在用、却没意识到是 Rust 写的</strong>。
      </p>

      <Callout kind="rust" title="先给个「对号入座」总表">
        <ul style={{ margin: 0 }}>
          <li>React / Vue(前端框架)→ <strong>Yew / Leptos / Dioxus</strong></li>
          <li>Express / Nest.js(后端框架)→ <strong>axum / actix-web / Rocket</strong>(底座是 <strong>Tokio</strong>)</li>
          <li>Next.js(全栈 / SSR)→ <strong>Leptos / Dioxus</strong> 的全栈模式</li>
          <li>webpack / Babel / Rollup(构建)→ <strong>Rspack / SWC / Rolldown / Turbopack</strong></li>
          <li>ESLint / Prettier(质量)→ <strong>Biome / Oxc</strong></li>
          <li>Electron(桌面)→ <strong>Tauri</strong>;Node(运行时)→ <strong>Deno</strong></li>
        </ul>
      </Callout>

      <h2>① 你的前端工具链,正跑着大量 Rust</h2>
      <p>
        过去几年"用 Rust 重写前端工具"成了潮流——因为快几十倍。下面这些大概率已经在你的
        <code>node_modules</code> 或编辑器里默默运行:
      </p>
      <RepoGrid
        repos={[
          { name: 'SWC', repo: 'swc-project/swc', what: 'JS/TS 编译器,Next.js 默认编译器,Deno 也在用', like: 'Babel' },
          { name: 'Rspack', repo: 'web-infra-dev/rspack', what: '字节出品,兼容 webpack 生态的高速打包器', like: 'webpack' },
          { name: 'Rolldown', repo: 'rolldown/rolldown', what: 'Vite 团队在做的 Rust 版 Rollup,Vite 的下一代底座', like: 'Rollup' },
          { name: 'Biome', repo: 'biomejs/biome', what: '一体化 lint + format,原 Rome,一个工具顶 ESLint+Prettier', like: 'ESLint + Prettier' },
          { name: 'Oxc', repo: 'oxc-project/oxc', what: '极快的 JS 工具链集合(解析/lint/transform/minify)', like: 'ESLint/Babel 集合' },
          { name: 'Lightning CSS', repo: 'parcel-bundler/lightningcss', what: 'Parcel 出品的 CSS 解析/转换/压缩器', like: 'PostCSS + cssnano' },
        ]}
      />
      <Callout kind="info" title="还有">
        <strong>Turbopack</strong>(随 <a href="https://github.com/vercel/next.js" target="_blank" rel="noreferrer">vercel/next.js</a> 发布,Vercel 的下一代打包器)、
        <strong>Turborepo</strong>(<a href="https://github.com/vercel/turborepo" target="_blank" rel="noreferrer">vercel/turborepo</a>,monorepo 构建系统)也都是 Rust。
        注意:<strong>esbuild 是个例外——它是 Go 写的</strong>,不是 Rust。
      </Callout>

      <Figure title="一条前端工作流,处处是 Rust" caption="从写代码到交付,主流工具链的关键环节正被 Rust 逐个接管——这就是「前端为什么要懂 Rust」最具体的答案。">
        <Flow
          width={720}
          height={140}
          nodes={[
            { id: 'edit', x: 10, y: 50, w: 120, label: '写代码', sub: 'Zed 编辑器', tone: 'info' },
            { id: 'build', x: 165, y: 50, w: 130, label: '编译/打包', sub: 'SWC·Rspack·Rolldown', tone: 'rust' },
            { id: 'lint', x: 330, y: 50, w: 120, label: '检查/格式化', sub: 'Biome·Oxc', tone: 'rust' },
            { id: 'run', x: 485, y: 50, w: 110, label: '运行', sub: 'Deno', tone: 'ok' },
            { id: 'ship', x: 625, y: 50, w: 90, label: '交付', sub: 'Tauri', tone: 'warn' },
          ]}
          edges={[
            { from: 'edit', to: 'build' },
            { from: 'build', to: 'lint' },
            { from: 'lint', to: 'run' },
            { from: 'run', to: 'ship' },
          ]}
        />
      </Figure>

      <h2>② Rust 写的前端框架(对应 React / Vue 本身)</h2>
      <p>
        是的,你能<strong>用 Rust 写前端</strong>:这些框架把组件编译成 WebAssembly 跑在浏览器里。
        虽然生产占有率还远不及 React,但拿来理解"Rust + 前端"非常直观。
      </p>
      <RepoGrid
        repos={[
          { name: 'Leptos', repo: 'leptos-rs/leptos', what: '细粒度响应式 + 全栈 SSR,目前 Rust 前端里势头最猛', like: 'SolidJS + Next.js' },
          { name: 'Dioxus', repo: 'DioxusLabs/dioxus', what: '一套代码跨 Web / 桌面 / 移动,组件风格像 React', like: 'React + React Native' },
          { name: 'Yew', repo: 'yewstack/yew', what: '最早成名的 Rust 前端框架,组件 + 虚拟 DOM', like: 'React' },
        ]}
      />

      <h2>③ Web 后端 & 异步基石(对应 Express / Nest)</h2>
      <RepoGrid
        repos={[
          { name: 'Tokio', repo: 'tokio-rs/tokio', what: '异步运行时,几乎整个 Rust 服务端生态的地基', like: 'Node 的事件循环' },
          { name: 'axum', repo: 'tokio-rs/axum', what: 'Tokio 团队的现代 Web 框架,类型安全的提取器', like: 'Express / Fastify' },
          { name: 'actix-web', repo: 'actix/actix-web', what: '性能榜常年第一梯队的 Web 框架', like: 'Fastify' },
          { name: 'Rocket', repo: 'rwf2/Rocket', what: '重开发体验、约定优于配置的框架', like: 'Nest.js' },
        ]}
      />

      <h2>④ 命令行神器(你可能天天用,却不知是 Rust)</h2>
      <p>这一类最"出圈":一批 Rust CLI 工具因为<strong>又快又好用</strong>,成了开发者新的默认选择。</p>
      <RepoGrid
        repos={[
          { name: 'ripgrep (rg)', repo: 'BurntSushi/ripgrep', what: '超快代码搜索,VS Code 的全局搜索内置就是它', like: 'grep' },
          { name: 'fd', repo: 'sharkdp/fd', what: '更友好更快的文件查找', like: 'find' },
          { name: 'bat', repo: 'sharkdp/bat', what: '带语法高亮和分页的 cat', like: 'cat' },
          { name: 'eza', repo: 'eza-community/eza', what: '彩色、带图标的现代 ls', like: 'ls' },
          { name: 'starship', repo: 'starship/starship', what: '跨 shell 的高颜值命令行提示符', like: 'oh-my-zsh 主题' },
          { name: 'zoxide', repo: 'ajeetdsouza/zoxide', what: '会记忆的智能 cd,跳目录飞快', like: 'cd + z' },
          { name: 'delta', repo: 'dandavison/delta', what: '漂亮的 git diff / blame 高亮', like: 'git diff' },
          { name: 'Nushell', repo: 'nushell/nushell', what: '把数据当结构化表格处理的新型 shell', like: 'bash / zsh' },
        ]}
      />

      <h2>⑤ 数据库 · 搜索 · 数据(基础设施明星)</h2>
      <RepoGrid
        repos={[
          { name: 'Meilisearch', repo: 'meilisearch/meilisearch', what: '即开即用的即时搜索引擎,可自托管', like: 'Algolia' },
          { name: 'Qdrant', repo: 'qdrant/qdrant', what: '向量数据库,做 AI / RAG / 语义搜索的热门选择', like: 'Pinecone' },
          { name: 'SurrealDB', repo: 'surrealdb/surrealdb', what: '多模型数据库(文档/图/关系),自带实时与权限', like: 'Supabase/Firebase' },
          { name: 'Polars', repo: 'pola-rs/polars', what: '极快的 DataFrame,带 Python 绑定,数据处理常用', like: 'pandas' },
          { name: 'TiKV', repo: 'tikv/tikv', what: '分布式事务型键值库,CNCF 毕业项目', like: '分布式 Redis/etcd' },
          { name: 'Pingora', repo: 'cloudflare/pingora', what: 'Cloudflare 开源的网络代理框架,扛全球级流量', like: 'nginx' },
        ]}
      />

      <h2>⑥ 让人惊艳的大型应用(Rust 的天花板)</h2>
      <RepoGrid
        repos={[
          { name: 'Zed', repo: 'zed-industries/zed', what: '高性能协作代码编辑器,Atom / Tree-sitter 原班团队', like: 'VS Code' },
          { name: 'Ruff + uv', repo: 'astral-sh/ruff', what: 'Python 的 linter 与包管理器,快到让 Python 圈震动', like: 'ESLint / npm(给 Python)' },
          { name: 'Bevy', repo: 'bevyengine/bevy', what: '数据驱动(ECS)的开源游戏引擎,社区极活跃', like: 'Unity(开源向)' },
          { name: 'RustDesk', repo: 'rustdesk/rustdesk', what: '开源自托管远程桌面', like: 'TeamViewer' },
          { name: 'Alacritty', repo: 'alacritty/alacritty', what: 'GPU 加速的高性能终端', like: 'iTerm2' },
          { name: 'Servo', repo: 'servo/servo', what: '实验性浏览器引擎——Rust 这门语言就诞生于此', like: '浏览器内核' },
        ]}
      />
      <Callout kind="tip" title="大厂也在押注">
        AWS 的 <a href="https://github.com/firecracker-microvm/firecracker" target="_blank" rel="noreferrer">Firecracker</a>
        (Lambda 背后的 microVM)、Cloudflare(Pingora / Workers)、Discord(消息服务)、Dropbox、1Password、
        微软与谷歌的系统底层,乃至 <strong>Linux 内核</strong>都已引入 Rust。它早已不是"小众玩具"。
      </Callout>

      <h2>⑦ 学习与语言本身</h2>
      <RepoGrid
        repos={[
          { name: 'rust-lang/rust', repo: 'rust-lang/rust', what: '语言、编译器与标准库本体,想读源码/提 issue 从这里开始' },
          { name: 'The Rust Book', repo: 'rust-lang/book', what: '官方权威教程「The Book」,有中文版' },
          { name: 'Rustlings', repo: 'rust-lang/rustlings', what: '上百道编译器驱动的小练习,改到编译通过就学会了' },
          { name: 'awesome-rust', repo: 'rust-unofficial/awesome-rust', what: 'Rust 资源大全,想找某领域的库先来这翻' },
        ]}
      />

      <Callout kind="info" title="本章要点 & 下一步">
        ① 你前端工作流里的构建/检查/运行环节,正被 Rust 工具(SWC/Rspack/Rolldown/Biome/Oxc/Deno/Tauri)接管;
        ② Rust 也有自己的前端框架(Leptos/Dioxus/Yew)和后端框架(axum/actix,基于 Tokio);
        ③ 大量 CLI 神器与基础设施明星(ripgrep、Meilisearch、Polars、Zed、Bevy…)都是 Rust。
        逛够了"别人的项目",<Pill>下一章</Pill>我们亲手写一个属于自己的 Rust 小工具收尾。
      </Callout>
    </>
  )
}

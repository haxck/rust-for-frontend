import { Link } from 'react-router-dom'
import { chapters, groupedChapters } from '../content/chapters'
import { useProgress } from '../hooks/useProgress'
import './Home.css'

export default function Home() {
  const groups = groupedChapters()
  const { completed } = useProgress()
  const first = chapters[0]
  const totalMin = chapters.reduce((n, c) => n + c.minutes, 0)

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-badges">
          <span className="hero-badge">🦀 Rust</span>
          <span className="hero-badge">面向前端工程师</span>
          <span className="hero-badge">可视化 · 可交互</span>
        </div>
        <h1 className="hero-title">
          用<em>前端的心智模型</em>
          <br />
          把 Rust 学进去
        </h1>
        <p className="hero-sub">
          你已经会 JavaScript / TypeScript 了。这门课不从零讲编程,而是把
          Rust 的每个概念都翻译成你熟悉的语言 —— 所有权对应什么、
          <code>Result</code> 取代了哪种 <code>try/catch</code>、Wasm 怎么和你的
          React 应用对话。配合可交互的动画一眼看懂。
        </p>
        <div className="hero-actions">
          <Link className="btn-primary" to={`/learn/${first.slug}`}>
            开始第 1 章 · {first.title} →
          </Link>
          <a
            className="btn-ghost"
            href="https://play.rust-lang.org/"
            target="_blank"
            rel="noreferrer"
          >
            打开 Rust Playground
          </a>
        </div>
        <div className="hero-stats">
          <div><strong>{chapters.length}</strong><span>章节</span></div>
          <div><strong>{totalMin}</strong><span>分钟</span></div>
          <div><strong>{completed.size}</strong><span>已完成</span></div>
        </div>
      </section>

      <section className="why-cards">
        <div className="why-card">
          <span className="why-ico">🧠</span>
          <h3>对照式讲解</h3>
          <p>每个语法点都给出 JS/TS 与 Rust 的并排代码,你看一眼就知道差异在哪。</p>
        </div>
        <div className="why-card">
          <span className="why-ico">🎞️</span>
          <h3>可视化核心难点</h3>
          <p>所有权 move、借用检查、栈与堆、迭代器管道 —— 用 SVG 动画让抽象变具体。</p>
        </div>
        <div className="why-card">
          <span className="why-ico">🛠️</span>
          <h3>动手做小工具</h3>
          <p>从环境搭建到一个能跑的 CLI 工具,再到编译成 WebAssembly 嵌进网页。</p>
        </div>
      </section>

      <section className="outline">
        <h2 className="outline-title">课程大纲</h2>
        {groups.map((g, gi) => (
          <div className="outline-group" key={g.group}>
            <div className="outline-group-name">{g.group}</div>
            <div className="outline-list">
              {g.items.map((ch) => {
                const idx =
                  groups.slice(0, gi).reduce((n, x) => n + x.items.length, 0) +
                  g.items.indexOf(ch)
                return (
                  <Link
                    key={ch.slug}
                    to={`/learn/${ch.slug}`}
                    className={`outline-item ${completed.has(ch.slug) ? 'is-done' : ''}`}
                  >
                    <span className="outline-num">
                      {completed.has(ch.slug) ? '✓' : String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="outline-ico">{ch.icon}</span>
                    <span className="outline-text">
                      <strong>{ch.title}</strong>
                      <span>{ch.subtitle}</span>
                    </span>
                    <span className="outline-min">{ch.minutes}′</span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </section>

      <footer className="home-foot">
        用 Vite · React · SVG 构建 · 一门为前端而生的 Rust 教程 🦀
      </footer>
    </div>
  )
}

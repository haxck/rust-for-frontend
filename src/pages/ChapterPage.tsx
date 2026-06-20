import { Suspense, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { chapterBySlug, chapterIndex, chapters } from '../content/chapters'
import { useProgress } from '../hooks/useProgress'
import './ChapterPage.css'

export default function ChapterPage() {
  const { slug = '' } = useParams()
  const ch = chapterBySlug(slug)
  const idx = chapterIndex(slug)
  const { completed, toggle } = useProgress()

  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [slug])

  if (!ch) {
    return (
      <div className="chapter">
        <h1>找不到这一章 🤔</h1>
        <Link to="/">返回首页</Link>
      </div>
    )
  }

  const prev = idx > 0 ? chapters[idx - 1] : null
  const next = idx < chapters.length - 1 ? chapters[idx + 1] : null
  const done = completed.has(ch.slug)
  const Body = ch.Component

  return (
    <article className="chapter prose">
      <div className="chapter-meta">
        <span className="chapter-kicker">
          第 {String(idx + 1).padStart(2, '0')} 章 · {ch.group}
        </span>
        <span className="chapter-mins">⏱ 约 {ch.minutes} 分钟</span>
      </div>
      <h1 className="chapter-title">
        <span className="chapter-title-icon">{ch.icon}</span>
        {ch.title}
      </h1>
      <p className="chapter-subtitle">{ch.subtitle}</p>
      <hr />

      <Suspense fallback={<div className="chapter-loading">加载中…</div>}>
        <Body />
      </Suspense>

      <div className="chapter-done">
        <button
          className={`done-btn ${done ? 'is-done' : ''}`}
          onClick={() => toggle(ch.slug)}
        >
          {done ? '✓ 已学完这一章' : '标记为已学完'}
        </button>
      </div>

      <nav className="chapter-nav">
        {prev ? (
          <Link className="nav-prev" to={`/learn/${prev.slug}`}>
            <span className="nav-dir">← 上一章</span>
            <span className="nav-name">{prev.icon} {prev.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link className="nav-next" to={`/learn/${next.slug}`}>
            <span className="nav-dir">下一章 →</span>
            <span className="nav-name">{next.icon} {next.title}</span>
          </Link>
        ) : (
          <Link className="nav-next" to="/">
            <span className="nav-dir">完结 🎉</span>
            <span className="nav-name">回到首页</span>
          </Link>
        )}
      </nav>
    </article>
  )
}

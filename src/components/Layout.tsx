import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { chapters, groupedChapters } from '../content/chapters'
import { useProgress } from '../hooks/useProgress'
import './Layout.css'

export default function Layout() {
  const groups = groupedChapters()
  const { completed } = useProgress()
  const [open, setOpen] = useState(false)
  const location = useLocation()
  const pct = Math.round((completed.size / chapters.length) * 100)

  return (
    <div className="layout">
      <header className="topbar">
        <button
          className="hamburger"
          aria-label="菜单"
          onClick={() => setOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-mark">🦀</span>
          <span className="brand-text">
            Rust <em>for</em> Frontend
          </span>
        </Link>
        <div className="topbar-progress" title={`已完成 ${completed.size}/${chapters.length}`}>
          <div className="topbar-progress-bar" style={{ width: `${pct}%` }} />
          <span className="topbar-progress-label">{pct}%</span>
        </div>
        <a
          className="topbar-link"
          href="https://play.rust-lang.org/"
          target="_blank"
          rel="noreferrer"
        >
          Rust Playground ↗
        </a>
      </header>

      <div className="body">
        <aside className={`sidebar ${open ? 'open' : ''}`}>
          <nav className="nav">
            <NavLink
              to="/"
              end
              className="nav-home"
              onClick={() => setOpen(false)}
            >
              🏠 课程首页
            </NavLink>
            {groups.map((g, gi) => (
              <div className="nav-group" key={g.group}>
                <div className="nav-group-title">{g.group}</div>
                {g.items.map((ch) => {
                  const idx =
                    groups.slice(0, gi).reduce((n, x) => n + x.items.length, 0) +
                    g.items.indexOf(ch)
                  return (
                    <NavLink
                      key={ch.slug}
                      to={`/learn/${ch.slug}`}
                      className="nav-item"
                      onClick={() => setOpen(false)}
                    >
                      <span className="nav-num">
                        {completed.has(ch.slug) ? '✓' : String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="nav-label">
                        <span className="nav-icon">{ch.icon}</span>
                        {ch.title}
                      </span>
                    </NavLink>
                  )
                })}
              </div>
            ))}
          </nav>
          <div className="sidebar-foot">
            为前端而写 · 共 {chapters.length} 章
          </div>
        </aside>

        {open && <div className="scrim" onClick={() => setOpen(false)} />}

        <main className="content" key={location.pathname}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

import { useState } from 'react'
import './viz.css'

interface Bar {
  label: string
  /** 起止格(0..10 的时间轴) */
  start: number
  end: number
  color: string
  kind: 'owner' | 'ref'
}
interface Scene {
  id: string
  tab: string
  code: string
  bars: Bar[]
  ok: boolean
  verdict: JSX.Element
}

const scenes: Scene[] = [
  {
    id: 'ok',
    tab: '✅ 合法',
    code: `let s = String::from("hi"); // s 诞生
let r = &s;                  // r 借用 s
println!("{r}");             // 用 r
// r 在这里结束
// s 在这里结束`,
    bars: [
      { label: "s (owner)", start: 1, end: 9, color: 'var(--rust)', kind: 'owner' },
      { label: "r = &s", start: 2, end: 7, color: 'var(--info)', kind: 'ref' },
    ],
    ok: true,
    verdict: (
      <>
        引用 <code>r</code> 的存活区间<b>完全包含在</b> <code>s</code> 的存活区间内。借用检查器满意:
        只要引用「活得不比数据久」,就安全。这就是生命周期的全部直觉。
      </>
    ),
  },
  {
    id: 'dangle',
    tab: '🛑 悬垂',
    code: `let r;                       // r 想活很久
{
    let s = String::from("hi"); // s 在小作用域里
    r = &s;                     // r 借用 s
}                               // ❌ s 在这里就死了
println!("{r}");                // r 却还想用 → 悬垂!`,
    bars: [
      { label: "r (引用)", start: 1, end: 9, color: 'var(--err)', kind: 'ref' },
      { label: "s (owner)", start: 3, end: 6, color: 'var(--rust)', kind: 'owner' },
    ],
    ok: false,
    verdict: (
      <>
        <code>r</code> 想活到第 9 格,但它借用的 <code>s</code> 第 6 格就被 drop 了。
        引用<b>比数据活得久</b> → 悬垂引用。Rust 在<b>编译期</b>报 <code>`s` does not live long enough</code>,
        根本不让你跑。C 里这是经典 use-after-free 漏洞。
      </>
    ),
  },
  {
    id: 'generic',
    tab: "函数里的 'a",
    code: `// 'a 把「返回的引用」和「参数的引用」绑在一起
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}
// 含义:返回值活得不超过 x、y 中较短的那个`,
    bars: [
      { label: "x: &'a str", start: 1, end: 8, color: 'var(--info)', kind: 'ref' },
      { label: "y: &'a str", start: 1, end: 6, color: 'var(--info)', kind: 'ref' },
      { label: "返回 &'a", start: 1, end: 6, color: 'var(--ok)', kind: 'ref' },
    ],
    ok: true,
    verdict: (
      <>
        当函数返回引用,编译器无法自动判断它来自哪个参数,就需要你用 <code>'a</code> <b>标注关系</b>:
        「返回值的生命周期 = 两个入参里较短的那个」。<code>'a</code> 不改变任何东西的存活时间,只是<b>描述</b>约束,
        让编译器能验证安全性。
      </>
    ),
  },
]

const GRID = 10
const X0 = 110
const X1 = 460
const cellW = (X1 - X0) / GRID

export default function LifetimeViz() {
  const [active, setActive] = useState(0)
  const sc = scenes[active]
  const rowY = (i: number) => 50 + i * 44

  return (
    <div className="viz">
      <div className="scenario-tabs">
        {scenes.map((s, i) => (
          <button key={s.id} className={`scenario-tab ${i === active ? 'active' : ''}`}
            onClick={() => setActive(i)}>
            {s.tab}
          </button>
        ))}
      </div>

      <svg viewBox="0 0 480 200" width="100%" role="img" aria-label="生命周期时间轴">
        {/* 时间轴箭头 */}
        <text x={10} y={28} fill="var(--fg-2)" fontSize="11" fontWeight="700">时间 / 作用域 →</text>
        <line x1={X0} y1={34} x2={X1 + 6} y2={34} stroke="var(--line-strong)" strokeWidth={1} />
        {Array.from({ length: GRID + 1 }, (_, i) => (
          <line key={i} x1={X0 + i * cellW} y1={31} x2={X0 + i * cellW} y2={170}
            stroke="var(--line)" strokeWidth={0.5} strokeDasharray="2 3" />
        ))}

        {/* 生命周期条 */}
        {sc.bars.map((b, i) => {
          const y = rowY(i)
          const x = X0 + b.start * cellW
          const w = (b.end - b.start) * cellW
          return (
            <g key={b.label}>
              <text x={10} y={y + 15} fill={b.color} fontSize="11" fontWeight="700">{b.label}</text>
              <rect x={x} y={y} width={w} height={22} rx={6}
                fill={b.color} opacity={0.22} stroke={b.color} strokeWidth={1.5} />
              {/* 起止端点 */}
              <circle cx={x} cy={y + 11} r={3} fill={b.color} />
              <circle cx={x + w} cy={y + 11} r={3} fill={b.color} />
            </g>
          )
        })}

        {/* 悬垂场景:画一条「越界」标记 */}
        {!sc.ok && (
          <g>
            <line x1={X0 + 6 * cellW} y1={40} x2={X0 + 6 * cellW} y2={170}
              stroke="var(--err)" strokeWidth={1.5} strokeDasharray="4 3" />
            <text x={X0 + 6 * cellW + 4} y={165} fill="var(--err)" fontSize="10">s 在此死亡</text>
          </g>
        )}
      </svg>

      <div className={`scenario-verdict ${sc.ok ? 'ok' : 'err'}`}>
        <span>{sc.ok ? '✅' : '🛑'}</span>
        <div>{sc.verdict}</div>
      </div>

      <pre style={{
        marginTop: 12, fontFamily: 'var(--font-mono)', fontSize: '0.76rem',
        background: 'var(--bg-2)', border: '1px solid var(--line)',
        borderRadius: 8, padding: '10px 12px', color: 'var(--fg-1)',
        whiteSpace: 'pre-wrap', lineHeight: 1.5,
      }}>
        {sc.code}
      </pre>
    </div>
  )
}

import { useState } from 'react'
import './viz.css'

interface Mode {
  id: string
  tab: string
  trait: string
  code: string
  arrow: string
  captureColor: string
  envAfter: 'alive' | 'mut' | 'moved'
  verdict: JSX.Element
}

const modes: Mode[] = [
  {
    id: 'fn',
    tab: 'Fn(借用)',
    trait: 'Fn',
    code: `let msg = String::from("hi");
// 只读取 msg → 按 & 借用捕获
let printer = || println!("{msg}");
printer();
printer();           // 可多次调用
println!("{msg}");   // ✅ msg 还能用`,
    arrow: '& 不可变借用',
    captureColor: 'var(--info)',
    envAfter: 'alive',
    verdict: (
      <>
        闭包只<b>读</b>外部变量,于是按 <code>&</code> 借用捕获,实现 <code>Fn</code>。
        可以<b>多次调用</b>,原变量在闭包外依然可用。对应 JS 里箭头函数读取外层 <code>const</code>。
      </>
    ),
  },
  {
    id: 'fnmut',
    tab: 'FnMut(可变借用)',
    trait: 'FnMut',
    code: `let mut count = 0;
// 修改 count → 按 &mut 借用捕获
let mut inc = || { count += 1; };
inc();
inc();               // 需要 mut 才能反复改
println!("{count}"); // 2`,
    arrow: '&mut 可变借用',
    captureColor: 'var(--warn)',
    envAfter: 'mut',
    verdict: (
      <>
        闭包<b>修改</b>外部变量,于是按 <code>&mut</code> 借用捕获,实现 <code>FnMut</code>。
        注意闭包变量自己也要 <code>mut</code>。在借用期间,外部不能再同时访问 <code>count</code>(借用规则)。
      </>
    ),
  },
  {
    id: 'fnonce',
    tab: 'FnOnce(move)',
    trait: 'FnOnce',
    code: `let data = vec![1, 2, 3];
// move 把 data 的所有权搬进闭包
let consume = move || {
    let total: i32 = data.iter().sum();
    println!("{total}");
};
consume();
// consume();        // ❌ 只能调一次
// println!("{:?}", data); // ❌ data 已被移走`,
    arrow: 'move 拿走所有权',
    captureColor: 'var(--rust)',
    envAfter: 'moved',
    verdict: (
      <>
        用 <code>move</code> 把变量<b>所有权搬进</b>闭包(线程、异步任务里很常见)。如果闭包消耗掉了它,
        就只实现 <code>FnOnce</code> —— <b>最多调用一次</b>,且原变量在外面失效。
      </>
    ),
  },
]

export default function ClosureViz() {
  const [active, setActive] = useState(0)
  const m = modes[active]

  return (
    <div className="viz">
      <div className="scenario-tabs">
        {modes.map((mode, i) => (
          <button
            key={mode.id}
            className={`scenario-tab ${i === active ? 'active' : ''}`}
            onClick={() => setActive(i)}
          >
            {mode.tab}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'center' }}>
        <svg viewBox="0 0 360 210" width="100%" role="img" aria-label="闭包捕获示意">
          {/* 外部环境 */}
          <text x={20} y={28} fill="var(--fg-2)" fontSize="12" fontWeight="700">外部作用域</text>
          <rect x={20} y={40} width={120} height={150} rx={10}
            fill="rgba(106,166,255,0.05)" stroke="var(--line)" />
          {/* 被捕获的变量 */}
          <rect x={36} y={70} width={88} height={46} rx={8}
            fill={m.envAfter === 'moved' ? 'rgba(120,120,120,0.06)' : 'var(--bg-3)'}
            stroke={m.envAfter === 'moved' ? 'var(--fg-3)' : m.captureColor}
            strokeWidth={1.6}
            strokeDasharray={m.envAfter === 'moved' ? '5 4' : '0'} />
          <text x={80} y={92} fill={m.envAfter === 'moved' ? 'var(--fg-3)' : 'var(--fg-0)'}
            fontSize="13" fontWeight="700" textAnchor="middle">变量</text>
          <text x={80} y={107} fill="var(--fg-3)" fontSize="9" textAnchor="middle">
            {m.envAfter === 'moved' ? '已被 move' : m.envAfter === 'mut' ? '可被改' : '只读'}
          </text>

          {/* 闭包 */}
          <text x={235} y={28} fill="var(--fg-2)" fontSize="12" fontWeight="700">闭包</text>
          <rect x={210} y={55} width={130} height={110} rx={12}
            fill="var(--rust-soft)" stroke="var(--rust-deep)" strokeWidth={1.6} />
          <text x={275} y={95} fill="var(--rust)" fontSize="22" textAnchor="middle">||</text>
          <text x={275} y={120} fill="var(--fg-1)" fontSize="11" textAnchor="middle">捕获环境</text>
          <text x={275} y={148} fill={m.captureColor} fontSize="13" fontWeight="800" textAnchor="middle">
            {m.trait}
          </text>

          {/* 捕获箭头 */}
          <path d={`M 128 93 C 170 93, 175 100, 208 100`}
            fill="none" stroke={m.captureColor} strokeWidth={2}
            markerEnd="url(#cl-arrow)" />
          <g>
            <rect x={130} y={30} width={80} height={18} rx={5} fill="var(--bg-0)" stroke="var(--line)" />
            <text x={170} y={43} fill={m.captureColor} fontSize="9.5" textAnchor="middle">{m.arrow}</text>
          </g>

          <defs>
            <marker id="cl-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L6,3 L0,6 Z" fill={m.captureColor} />
            </marker>
          </defs>
        </svg>

        <pre style={{
          margin: 0, fontFamily: 'var(--font-mono)', fontSize: '0.74rem',
          background: 'var(--bg-2)', border: '1px solid var(--line)',
          borderRadius: 8, padding: '10px 12px', color: 'var(--fg-1)',
          whiteSpace: 'pre-wrap', lineHeight: 1.5,
        }}>
          {m.code}
        </pre>
      </div>

      <div className="mem-legend">
        <span><i style={{ background: 'var(--info)' }} />Fn:只读借用,可多次调用</span>
        <span><i style={{ background: 'var(--warn)' }} />FnMut:可变借用,可多次调用</span>
        <span><i style={{ background: 'var(--rust)' }} />FnOnce:取走所有权,最多一次</span>
      </div>

      <div className="viz-caption-line">{m.verdict}</div>
    </div>
  )
}

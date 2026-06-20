import { useState, type ReactNode } from 'react'
import CodeBlock from './CodeBlock'
import RustRunner from './RustRunner'
import { Quiz, type QuizOption } from './Ui'
import './Lab.css'

/* ============================================================
   ErrorDrill —— 编译器报错训练
   给一段编译不过的代码 + 真实 rustc 报错片段,
   让读者判断「为什么错 / 怎么修」。比单选 Quiz 更贴近真实学习。
   ============================================================ */
export function ErrorDrill({
  code,
  error,
  question,
  options,
  explain,
  title,
}: {
  code: string
  /** 编译器报错片段(原样粘贴 rustc 输出即可) */
  error: string
  question: ReactNode
  options: QuizOption[]
  explain?: ReactNode
  title?: string
}) {
  return (
    <div className="drill">
      <div className="drill-head">
        <span className="drill-badge">🔍 报错训练</span>
        <span className="drill-title">{title ?? '读懂下面的编译错误'}</span>
      </div>
      <CodeBlock code={code} lang="rust" title="编译不过的代码" />
      <div className="drill-error">
        <span className="drill-error-tag">rustc 报错</span>
        <pre>{error.replace(/^\n+|\n+$/g, '')}</pre>
      </div>
      <Quiz question={question} options={options} explain={explain} />
    </div>
  )
}

/* ============================================================
   MicroLab —— 5–10 分钟动手练习
   预置一段「有 TODO / 故意写坏」的可运行代码,读者改完点运行验证。
   配可折叠的「提示」与「参考答案」。
   ============================================================ */
export function MicroLab({
  title,
  goal,
  starter,
  hint,
  solution,
  expectedOutput,
  minutes = 5,
}: {
  title: string
  /** 任务说明 */
  goal: ReactNode
  /** 起始代码(含 TODO 或待修复的错误) */
  starter: string
  /** 提示(折叠) */
  hint?: ReactNode
  /** 参考答案代码(折叠) */
  solution?: string
  /** 期望输出,作为运行前的目标提示 */
  expectedOutput?: string
  minutes?: number
}) {
  const [showHint, setShowHint] = useState(false)
  const [showSolution, setShowSolution] = useState(false)

  return (
    <div className="lab">
      <div className="lab-head">
        <span className="lab-badge">🔧 动手练习</span>
        <span className="lab-title">{title}</span>
        <span className="lab-mins">⏱ {minutes} 分钟</span>
      </div>
      <div className="lab-goal">{goal}</div>

      <RustRunner
        initialCode={starter.replace(/^\n+|\n+$/g, '')}
        title="lab.rs · 改我 → 运行"
        expectedOutput={expectedOutput}
      />

      <div className="lab-tools">
        {hint && (
          <button
            className={`lab-toggle ${showHint ? 'open' : ''}`}
            onClick={() => setShowHint((v) => !v)}
          >
            💡 {showHint ? '收起提示' : '看提示'}
          </button>
        )}
        {solution && (
          <button
            className={`lab-toggle ${showSolution ? 'open' : ''}`}
            onClick={() => setShowSolution((v) => !v)}
          >
            ✅ {showSolution ? '收起参考答案' : '看参考答案'}
          </button>
        )}
      </div>

      {showHint && hint && <div className="lab-hint">{hint}</div>}
      {showSolution && solution && (
        <div className="lab-solution">
          <CodeBlock code={solution} lang="rust" title="参考答案(可复制进上方运行)" />
        </div>
      )}
    </div>
  )
}

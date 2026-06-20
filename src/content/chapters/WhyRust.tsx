import CodeBlock from '../../components/CodeBlock'
import { Callout, Compare, KeyTerm, Quiz, Figure, Pill } from '../../components/Ui'
import Flow from '../../components/viz/Flow'

export default function WhyRust() {
  return (
    <>
      <p>
        如果你是前端工程师,可能觉得 Rust 是「写操作系统的人才碰的东西」。但其实,
        <strong>你每天用的工具链里早就塞满了 Rust</strong>。这一章我们先建立动机:为什么值得花时间学它,
        以及它和你已经掌握的 JavaScript / TypeScript 到底是什么关系。
      </p>

      <h2>Rust 早就在你身边</h2>
      <p>
        你不一定写过 Rust,但你几乎天天在<strong>运行</strong> Rust 写的程序:
      </p>
      <ul>
        <li><Pill>构建</Pill> <strong>SWC</strong>(Next.js 默认编译器)、<strong>Turbopack</strong>、<strong>Rspack</strong>、<strong>Rolldown</strong> —— 取代 Babel/webpack 的下一代工具,全是 Rust。</li>
        <li><Pill>Lint/格式化</Pill> <strong>Biome</strong>(原 Rome)、<strong>Oxc</strong> —— 比 ESLint + Prettier 快几十倍。</li>
        <li><Pill>运行时</Pill> <strong>Deno</strong> 的核心、<strong>Node</strong> 的部分模块。</li>
        <li><Pill>桌面</Pill> <strong>Tauri</strong> —— 用前端写 UI、Rust 写后端的 Electron 替代品,体积小一个数量级。</li>
        <li><Pill>浏览器</Pill> <strong>Figma</strong>、<strong>Photoshop Web</strong> 把性能敏感的核心编译成 <strong>WebAssembly</strong> 跑在你的浏览器里。</li>
      </ul>
      <Callout kind="rust">
        换句话说:<strong>学 Rust 不是转行,而是「能看懂并改进自己脚下的工具」</strong>。哪天 Vite 插件用
        Rust 重写、或者你想给团队写个超快的代码扫描器,这门技能就直接变现了。
      </Callout>

      <h2>它解决了什么 JS 解决不了的问题?</h2>
      <p>
        JavaScript 有两大「省心」的设计:<strong>垃圾回收(GC)</strong> 帮你管内存,
        <strong>动态类型</strong>让你随手写。代价是:运行时开销、不可预测的卡顿(GC 暂停),
        以及一大类只能在运行时才炸的 bug。Rust 走了另一条路:
      </p>

      <Compare
        jsTitle="JavaScript:运行时才发现问题"
        rustTitle="Rust:编译期就拦下"
        js={`const user = users.find(u => u.id === id)
// user 可能是 undefined
console.log(user.name)
// 💥 运行到这行才报:
// Cannot read properties of undefined`}
        rust={`let user = users.iter().find(|u| u.id == id);
// user 的类型是 Option<&User>
println!("{}", user.name);
// ❌ 编译不过:Option 必须先解包
// 编译器逼你处理「找不到」的情况`}
        note="同一类 bug,JS 留到线上炸,Rust 在你按下保存时就标红。这是「把错误左移」的极致。"
      />

      <KeyTerm term="零成本抽象" en="zero-cost abstraction" analogy="像 TS 的类型——只在编译期存在,运行时完全消失,不拖慢速度。">
        Rust 让你写高级、可读的代码(迭代器、泛型、trait),但编译后的机器码和你手写的底层循环一样快。
        「你没用到的东西不花钱,你用到的东西没法手写得更快」。
      </KeyTerm>

      <h2>三个让前端眼前一亮的特性</h2>
      <p>抛开「系统编程」的刻板印象,从前端视角看,Rust 真正的卖点是:</p>
      <ol>
        <li><strong>没有 <code>undefined is not a function</code></strong> —— 用 <code>Option</code>/<code>Result</code> 把「空」和「错」变成类型系统的一部分,编译器强制你处理。</li>
        <li><strong>没有数据竞争</strong> —— 多线程并发由编译器保证安全,这在 JS 单线程世界里你甚至没机会体会到它有多难。</li>
        <li><strong>没有 GC 卡顿</strong> —— 内存何时释放是确定的(见后面的「所有权」章节),适合做对延迟敏感的核心。</li>
      </ol>

      <h2>从源码到运行:和 JS 的本质区别</h2>
      <p>
        JS 是<strong>解释/即时编译</strong>:源码发给浏览器,引擎边跑边编译。Rust 是
        <strong>提前编译(AOT)</strong>:在你的机器上先编成原生机器码或 Wasm,用户拿到的是成品。
        多了一道「编译关」,但这道关帮你挡掉了海量 bug。
      </p>

      <Figure title="编译流水线:rustc 如何把代码变成可执行文件" caption="借用检查(borrow check)是 Rust 独有的一关,也是它内存安全的来源——后面两章会专门拆解。">
        <Flow
          width={720}
          height={150}
          nodes={[
            { id: 'src', x: 10, y: 50, w: 110, label: '.rs 源码', tone: 'muted' },
            { id: 'check', x: 160, y: 50, w: 140, label: '类型 + 借用检查', sub: 'borrow checker', tone: 'rust' },
            { id: 'mir', x: 340, y: 50, w: 110, label: 'LLVM IR', tone: 'info' },
            { id: 'bin', x: 490, y: 30, w: 120, label: '原生可执行文件', sub: 'x86 / ARM', tone: 'ok' },
            { id: 'wasm', x: 490, y: 90, w: 120, label: 'WebAssembly', sub: '.wasm → 浏览器', tone: 'ok' },
          ]}
          edges={[
            { from: 'src', to: 'check' },
            { from: 'check', to: 'mir', label: '通过才继续' },
            { from: 'mir', to: 'bin' },
            { from: 'mir', to: 'wasm' },
          ]}
        />
      </Figure>

      <Callout kind="tip" title="先跑一行再说">
        不用装任何东西。下面这段经典的 Hello World <strong>可以直接编辑、点「▶ 运行」就地执行</strong>——
        代码会发到官方 Rust Playground 云端编译,输出实时显示在下方。试着把名字改成你自己的再跑一次。
      </Callout>

      <CodeBlock
        runnable
        title="hello.rs"
        code={`fn main() {
    let name = "前端工程师";
    println!("你好,{name}!欢迎来到 Rust 🦀");
}`}
        output={`你好,前端工程师!欢迎来到 Rust 🦀`}
      />
      <p>
        眼熟吗?<code>fn</code> 像 <code>function</code>,<code>let</code> 你天天写,字符串插值
        <code>{'{name}'}</code> 和模板字符串如出一辙。差别是结尾的分号、<code>println!</code> 后面那个
        <code>!</code>(它是「宏」,下一章细说),以及 <code>fn main()</code> 是程序入口。
      </p>

      <Quiz
        question="下面哪一项最准确地描述了「为什么前端值得学 Rust」?"
        options={[
          { text: '因为 Rust 要取代 JavaScript 成为浏览器语言' },
          { text: '因为现代前端工具链(打包、lint、运行时)大量用 Rust 重写,且能编译成 Wasm 跑在浏览器里', correct: true },
          { text: '因为 Rust 语法比 JS 简单,适合新手入门' },
          { text: '因为学了 Rust 就不用再写 JS 了' },
        ]}
        explain={
          <>
            Rust 不会取代 JS(它们协作),语法也不算简单。真正的理由是:它已经是前端基础设施的
            <strong>底座</strong>,并且通过 WebAssembly 直接进入浏览器,和你的 React/Vue 应用共存。
          </>
        }
      />

      <Callout kind="info" title="这门课怎么学">
        每一章都会:① 用你熟悉的 JS/TS 做类比;② 给可以直接运行的代码;③ 用动画把抽象概念画出来。
        遇到 🧠 自测就动手点一点,遇到 ▶ 就去 Playground 跑一跑。下一章我们先把开发环境搭起来。
      </Callout>
    </>
  )
}

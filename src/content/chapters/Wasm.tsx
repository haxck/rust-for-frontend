import CodeBlock from '../../components/CodeBlock'
import { Callout, Compare, KeyTerm, Quiz, Figure } from '../../components/Ui'
import Flow from '../../components/viz/Flow'

export default function Wasm() {
  return (
    <>
      <p>
        终于到了前端最兴奋的部分。<strong>WebAssembly(Wasm)</strong> 是一种能在浏览器里以接近原生速度
        运行的二进制格式。把 Rust 编译成 Wasm,你就能在网页里跑高性能代码,并和 JS <strong>双向调用</strong>——
        这是 Rust 给前端最直接的回报。
      </p>

      <h2>Wasm 是什么、不是什么</h2>
      <ul>
        <li>✅ 它是一个<strong>编译目标</strong>:C/C++/Rust 等都能编译成 <code>.wasm</code>,在浏览器沙箱里高速运行。</li>
        <li>✅ 它和 JS <strong>互补</strong>:JS 负责 DOM、事件、胶水;Wasm 负责计算密集的核心。</li>
        <li>❌ 它<strong>不</strong>取代 JS,也不能直接操作 DOM(要通过 JS 桥接)。</li>
      </ul>
      <Callout kind="rust" title="什么场景值得上 Wasm?">
        图像/视频处理、音频编解码、加解密、物理/游戏引擎、复杂数据解析、CAD、电子表格计算……
        凡是「JS 跑起来嫌慢、又不方便丢服务器」的纯计算,都是 Wasm 的主场。Figma、Photoshop Web、
        Google Earth 都这么干。
      </Callout>

      <h2>工具链:wasm-pack + wasm-bindgen</h2>
      <p>
        Rust 生态把 Wasm 的繁琐细节都封装好了。核心是两件套:<code>wasm-bindgen</code>
        (在 Rust 和 JS 间自动生成胶水代码)和 <code>wasm-pack</code>(一键打包成可被 npm/bundler 使用的模块)。
      </p>

      <Figure title="Rust → Wasm → 你的前端项目" caption="wasm-pack 产出的 pkg/ 目录里有 .wasm 文件 + 自动生成的 .js 胶水 + .d.ts 类型声明,可直接 import,Vite/webpack 原生支持。">
        <Flow
          width={720}
          height={170}
          nodes={[
            { id: 'rs', x: 10, y: 60, w: 110, label: 'lib.rs', sub: 'Rust 源码', tone: 'rust' },
            { id: 'pack', x: 160, y: 60, w: 140, label: 'wasm-pack build', sub: '编译 + 绑定', tone: 'info' },
            { id: 'pkg', x: 350, y: 60, w: 130, label: 'pkg/', sub: '.wasm + .js + .d.ts', tone: 'ok' },
            { id: 'app', x: 540, y: 30, w: 160, label: 'import 进 React', sub: 'Vite / webpack', tone: 'ok' },
            { id: 'npm', x: 540, y: 105, w: 160, label: '发布到 npm', sub: '给别人用', tone: 'muted' },
          ]}
          edges={[
            { from: 'rs', to: 'pack' },
            { from: 'pack', to: 'pkg' },
            { from: 'pkg', to: 'app' },
            { from: 'pkg', to: 'npm' },
          ]}
        />
      </Figure>

      <h2>写一个能被 JS 调用的 Rust 函数</h2>
      <p>关键就是给函数加上 <code>#[wasm_bindgen]</code> 标注,导出给 JS:</p>
      <CodeBlock
        title="src/lib.rs"
        code={`use wasm_bindgen::prelude::*;

// 导出给 JS 调用的函数
#[wasm_bindgen]
pub fn fib(n: u32) -> u64 {
    match n {
        0 => 0,
        1 => 1,
        _ => {
            let (mut a, mut b) = (0u64, 1u64);
            for _ in 2..=n { let t = a + b; a = b; b = t; }
            b
        }
    }
}

// 也能接收/返回字符串,bindgen 自动处理编码转换
#[wasm_bindgen]
pub fn greet(name: &str) -> String {
    format!("你好 {name},来自 Rust+Wasm!")
}`}
      />
      <CodeBlock
        lang="bash"
        title="构建"
        code={`# 安装一次
cargo install wasm-pack

# 针对打包器(Vite/webpack)构建,产物在 pkg/
wasm-pack build --target bundler`}
      />

      <h2>在 React 里使用</h2>
      <p>
        Wasm 模块的加载是异步的(要先 fetch + 编译 <code>.wasm</code>),所以通常在 <code>useEffect</code>
        里初始化。之后调用 Rust 函数就和调用普通 JS 函数一模一样:
      </p>
      <Compare
        jsLang="tsx"
        jsTitle="纯 JS 实现(慢)"
        rustTitle="调用 Rust+Wasm(快)"
        js={`function fib(n: number): number {
  if (n < 2) return n;
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++)
    [a, b] = [b, a + b];
  return b;
}
// 计算量极大时,主线程会卡`}
        rust={`import { useEffect, useState } from "react";
import init, { fib } from "./pkg/my_wasm";

function App() {
  const [ready, setReady] = useState(false);
  useEffect(() => { init().then(() => setReady(true)); }, []);

  if (!ready) return <p>加载 Wasm 中…</p>;
  return <p>fib(50) = {String(fib(50))}</p>;
}`}
        note="init() 完成后,fib 就是个普通函数。对于重计算(大数、图像卷积、解析),Wasm 通常比 JS 快数倍,且性能更稳定。"
      />

      <KeyTerm term="数据穿越边界有成本" en="the boundary cost" analogy="像主线程和 Web Worker 之间 postMessage:传大块数据要序列化/拷贝,频繁小调用反而可能比纯 JS 还慢。">
        数字这类基本类型穿越 JS↔Wasm 边界几乎免费,但复杂对象、大数组需要拷贝或编码。
        <strong>设计原则</strong>:让 Wasm 做「一大块连续的重计算」,而不是被 JS 在循环里高频调用。
        粒度太细,边界开销会吃掉性能收益。
      </KeyTerm>

      <Callout kind="tip" title="不想搭脚手架?">
        想快速体验,可以用模板:<code>npm create vite@latest</code> 建前端,再加一个用
        <code>wasm-pack new</code> 生成的 Rust crate;或直接看官方 <em>rustwasm</em> 的
        <code>create-wasm-app</code> 模板。Vite 对 <code>.wasm</code> 的 import 开箱即用。
      </Callout>

      <Quiz
        question="关于 Rust + WebAssembly,下面哪个说法是对的?"
        options={[
          { text: 'Wasm 会取代 JavaScript,以后前端都用 Rust 写' },
          { text: 'Wasm 适合承担计算密集的核心逻辑,与 JS 互补;但频繁跨边界传大数据会有开销,要控制调用粒度', correct: true },
          { text: 'Rust 编译的 Wasm 可以直接操作 DOM,不需要 JS' },
          { text: 'Wasm 只能在 Node.js 里运行,不能在浏览器里跑' },
        ]}
        explain={
          <>
            Wasm 在浏览器里跑,但不能直接碰 DOM(要经 JS),也不取代 JS——两者协作。它的甜点是
            「一大块纯计算」。跨 JS↔Wasm 边界传复杂/大数据有拷贝成本,所以要让单次调用做更多事,
            而不是高频小调用。
          </>
        }
      />

      <Callout kind="info" title="本章要点 & 下一步">
        ① Wasm 让 Rust 在浏览器里近原生速度运行,与 JS 互补;② <code>wasm-bindgen</code> + <code>wasm-pack</code> 自动生成胶水;
        ③ 在 React 里 <code>init()</code> 后即可像普通函数调用;④ 注意跨边界的数据开销。
        下一章先纵览 Rust 的 crate 生态地图,然后在收官章把所学串成一个能跑的命令行小工具!
      </Callout>
    </>
  )
}

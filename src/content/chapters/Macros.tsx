import CodeBlock from '../../components/CodeBlock'
import { Callout, Compare, KeyTerm, Quiz, Figure } from '../../components/Ui'
import Flow from '../../components/viz/Flow'

export default function Macros() {
  return (
    <>
      <p>
        从第一章起,<code>println!</code> 后面那个 <code>!</code> 就一直在。现在揭晓:它表示这是个
        <strong>宏(macro)</strong>。宏是「写代码的代码」——在<strong>编译期</strong>展开成普通 Rust 代码。
        作为前端,你大概率<strong>用</strong>宏远多于<strong>写</strong>宏,所以本章重点是「看懂、会用」。
      </p>

      <h2>宏不是函数</h2>
      <p>
        带 <code>!</code> 的是宏,不带的是函数。区别在于:函数在运行时被调用;宏在编译期被<strong>展开</strong>成代码,
        因此能做函数做不到的事——比如接收<strong>任意数量</strong>的参数、在编译期<strong>检查</strong>格式串、
        甚至<strong>生成</strong>整个 trait 实现。
      </p>
      <Figure title="宏的工作时机:编译期展开" caption="宏在源码被真正编译前,先被「展开」成等价的普通 Rust 代码,然后才进入正常的编译流程。">
        <Flow
          width={700}
          height={150}
          nodes={[
            { id: 'src', x: 10, y: 50, w: 130, label: '含宏的源码', sub: 'vec![1,2,3]', tone: 'rust' },
            { id: 'expand', x: 180, y: 50, w: 140, label: '宏展开', sub: 'macro expansion', tone: 'warn' },
            { id: 'plain', x: 360, y: 50, w: 160, label: '普通 Rust 代码', sub: '一段 Vec::new()+push', tone: 'info' },
            { id: 'compile', x: 560, y: 50, w: 120, label: '正常编译', tone: 'ok' },
          ]}
          edges={[
            { from: 'src', to: 'expand' },
            { from: 'expand', to: 'plain' },
            { from: 'plain', to: 'compile' },
          ]}
        />
      </Figure>

      <Compare
        jsTitle="JS:没有真正的宏"
        rustTitle="Rust:宏在编译期生成代码"
        js={`// JS 最接近的是模板字符串 / 标签函数
const v = [1, 2, 3];
console.log(\`值是 \${v}\`);

// 想「生成代码」只能靠构建插件 / codegen 脚本`}
        rust={`let v = vec![1, 2, 3];        // vec! 宏
println!("值是 {:?}", v);     // println! 宏

// 宏是语言内建能力,编译期展开,类型安全`}
        note="JS 的模板字符串、标签模板有点宏的影子,但 Rust 宏是真正的语法级元编程,且全程类型检查。"
      />

      <h2>你每天都在用的宏</h2>
      <CodeBlock
        title="常见声明宏(declarative macros)"
        code={`println!("{}", x);       // 打印 + 换行
print!("no newline");    // 打印不换行
eprintln!("到 stderr");   // 错误输出
format!("{}-{}", a, b);  // 拼成 String(不打印)
vec![1, 2, 3];           // 构造 Vec
vec![0; 5];              // [0, 0, 0, 0, 0]
assert_eq!(a, b);        // 断言相等(测试用)
panic!("出大事了");       // 主动崩溃
todo!();                 // 占位:还没实现(会 panic)
dbg!(x);                 // 调试:打印「文件:行号 + 表达式 + 值」并返回值`}
      />
      <Callout kind="tip" title="dbg! 是调试神器">
        前端爱用 <code>console.log</code> 临时调试。Rust 的 <code>dbg!</code> 更强:它打印
        <strong>所在文件、行号、表达式原文和它的值</strong>,还会把值<strong>返回</strong>,所以能直接套在表达式里:
        <CodeBlock code={`let n = dbg!(2 + 3) * 10;   // 打印 [src/main.rs:5] 2 + 3 = 5,然后 n = 50`} />
      </Callout>

      <KeyTerm term="为什么 println! 必须是宏" en="编译期格式检查" analogy="像 TS 模板字面量类型能在编译期校验字符串——但 println! 做得更彻底,参数数量/类型对不上直接编译失败。">
        <code>println!("{} {}", a)</code> 会<strong>编译报错</strong>:占位符要两个参数,你只给了一个。
        普通函数做不到这种检查(它运行时才知道参数),而宏在编译期就能分析格式串。这就是为什么这些
        格式化设施被设计成宏。
      </KeyTerm>

      <h2>派生宏:#[derive] 也是宏</h2>
      <p>
        回忆「Trait 与泛型」章的 <code>#[derive(Debug, Clone)]</code>——它是一种<strong>派生宏</strong>,
        在编译期<strong>自动生成</strong>整个 trait 实现的代码。你写一行,宏帮你展开出几十行:
      </p>
      <CodeBlock
        code={`#[derive(Debug, Clone, PartialEq)]
struct Point { x: i32, y: i32 }
// 宏在编译期生成了 Debug、Clone、PartialEq 三个 impl 块
// 否则你得手写几十行重复代码`}
      />
      <Callout kind="rust" title="三类宏(了解即可)">
        ① <b>声明宏</b> <code>macro_rules!</code>(如 <code>vec!</code>)—— 按模式匹配生成代码;
        ② <b>派生宏</b> <code>#[derive(...)]</code> —— 为类型自动实现 trait;
        ③ <b>属性/函数式过程宏</b>(如 <code>#[tokio::main]</code>、<code>#[wasm_bindgen]</code>)—— 最强大,能任意改写代码。
        日常你主要是这些宏的<strong>使用者</strong>。
      </Callout>

      <h2>瞄一眼怎么写一个简单宏</h2>
      <p>不要求掌握,感受一下 <code>macro_rules!</code> 的样子即可——它本质是「输入模式 → 输出代码」的匹配:</p>
      <CodeBlock
        runnable
        title="自定义一个 max! 宏"
        code={`// 定义一个能取任意多个数里最大值的宏
macro_rules! my_max {
    ($x:expr) => { $x };                       // 只有一个 → 它自己
    ($x:expr, $($rest:expr),+) => {            // 一个 + 剩下若干
        {
            let rest_max = my_max!($($rest),+); // 递归展开
            if $x > rest_max { $x } else { rest_max }
        }
    };
}

fn main() {
    println!("{}", my_max!(3));            // 3
    println!("{}", my_max!(3, 7, 2, 9, 1)); // 9
}`}
        output={`3
9`}
      />
      <Callout kind="warn" title="别急着自己写宏">
        宏功能强大但调试困难、可读性差。社区共识是:<strong>能用函数/泛型解决的,就别用宏</strong>。
        作为前端,你 99% 的时间是在<strong>调用</strong>现成的宏(来自标准库和各种 crate),而不是发明新宏。看懂即可。
      </Callout>

      <Quiz
        question="为什么 println! 被设计成宏而不是普通函数?"
        options={[
          { text: '因为宏运行得更快' },
          { text: '因为宏能在编译期分析格式字符串,检查占位符与参数的数量/类型是否匹配,并支持可变数量的参数', correct: true },
          { text: '因为函数不能打印到控制台' },
          { text: '因为宏不需要导入' },
        ]}
        explain={
          <>
            普通函数的参数个数和类型是固定的,且运行时才求值;而 <code>println!</code> 需要接收<strong>任意数量</strong>
            的参数,并在<strong>编译期</strong>校验格式串 <code>"{} {}"</code> 与实参是否对得上。这些只有宏能做到——
            参数不匹配会直接编译失败,而不是运行时才炸。
          </>
        }
      />

      <Callout kind="info" title="本章要点 & 下一步">
        ① 带 <code>!</code> 的是宏,编译期展开成代码;② <code>println!</code>/<code>vec!</code>/<code>dbg!</code>/<code>assert_eq!</code> 是日常主力;
        ③ <code>#[derive]</code> 和 <code>#[tokio::main]</code> 也是宏;④ 重在会用,自己写宏要谨慎。
        进阶部分到此结束!接下来回到前端主场,先纵览 Rust 的 crate 生态地图。
      </Callout>
    </>
  )
}

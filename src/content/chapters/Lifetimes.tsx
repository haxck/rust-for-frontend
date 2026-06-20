import CodeBlock from '../../components/CodeBlock'
import { Callout, Compare, KeyTerm, Quiz, Figure } from '../../components/Ui'
import { ErrorDrill } from '../../components/Lab'
import LifetimeViz from '../../components/viz/LifetimeViz'

export default function Lifetimes() {
  return (
    <>
      <p>
        在「借用」一章我们埋了个伏笔:引用不能比它指向的数据活得久。这条规则的执行者就是
        <strong>生命周期(lifetime)</strong>。好消息:<strong>95% 的情况编译器自动搞定,你一个字都不用写</strong>。
        这一章帮你看懂那偶尔出现的 <code>&'a</code> 到底在说什么,不再被它吓退。
      </p>

      <h2>先建立直觉:一条时间轴</h2>
      <p>
        生命周期不是什么玄学,它就是「某个引用在程序里<strong>有效的那段时间</strong>」。规则只有一句:
        <strong>引用有效的区间,必须被它所指数据有效的区间完全包住。</strong> 切换下面三个场景看个明白:
      </p>

      <Figure
        title="交互:引用与数据的生命周期关系"
        caption="合法 = 引用区间被数据区间包含;悬垂 = 引用比数据活得久(编译器拒绝);最后看函数签名里的 'a 在表达什么。"
      >
        <LifetimeViz />
      </Figure>

      <h2>大多数时候你不用写:生命周期省略</h2>
      <p>
        编译器有一套「省略规则」,能自动推断绝大部分情况。下面这些函数你<strong>从没写过 <code>'a</code></strong>,
        因为编译器替你补上了:
      </p>
      <CodeBlock
        code={`// 你写的(没有任何生命周期标注)
fn first_word(s: &str) -> &str {
    s.split(' ').next().unwrap_or("")
}

// 编译器实际理解成(自动补全):
fn first_word<'a>(s: &'a str) -> &'a str { ... }
// 规则:只有一个输入引用时,输出引用的生命周期 = 它`}
      />
      <Callout kind="tip" title="什么时候才需要你手写?">
        当函数<strong>返回一个引用</strong>,且有<strong>多个输入引用</strong>、编译器无法判断返回的是哪一个时,
        它会让你标注。这是唯一常见的需要手写生命周期的场景。
      </Callout>

      <h2>需要手写的经典例子:longest</h2>
      <p>
        返回两个字符串里较长的那个。编译器懵了:返回的引用到底绑定 <code>x</code> 还是 <code>y</code>?
        你用 <code>'a</code> 告诉它「它们一视同仁,返回值活得不超过两者里较短的」:
      </p>
      <CodeBlock
        runnable
        title="生命周期标注"
        code={`// 'a 是一个「生命周期参数」,像泛型 <T> 一样声明
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}

fn main() {
    let s1 = String::from("长字符串");
    let result;
    {
        let s2 = String::from("短");
        result = longest(s1.as_str(), s2.as_str());
        println!("较长的是: {result}");   // ✅ 在 s2 还活着时用,没问题
    }
    // println!("{result}");  // ❌ 若放到这,s2 已死,编译器拦下
}`}
        output={`较长的是: 长字符串`}
      />
      <KeyTerm term="'a 不改变任何寿命" en="lifetime annotation" analogy="它像 TS 的类型标注——只是「描述」约束让编译器能验证,本身不产生任何运行时代码,也不会让谁多活一秒。">
        新手最大的误解是「加了 <code>'a</code> 就能让引用活更久」。<strong>不能。</strong>
        <code>'a</code> 只是<strong>陈述事实</strong>:「这几个引用的生命周期有这样的关系」。
        编译器据此检查你的代码是否安全,如果你的实际数据活不够久,它照样报错。
      </KeyTerm>

      <h2>结构体里持有引用</h2>
      <p>
        如果一个 struct <strong>存了引用</strong>(而不是拥有的值),也必须标注生命周期——意思是
        「这个结构体不能比它引用的数据活得久」:
      </p>
      <CodeBlock
        code={`// 这个结构体借用了一段字符串,而不是拥有它
struct Excerpt<'a> {
    part: &'a str,
}

let novel = String::from("叫我以实玛利。某年某月……");
let first = novel.split('。').next().unwrap();
let e = Excerpt { part: first };  // e 不能比 novel 活得久
println!("{}", e.part);`}
      />
      <Callout kind="rust" title="想躲开生命周期?持有所有权就行">
        如果生命周期标注让你头疼,通常有个简单出路:<strong>让结构体/函数持有拥有的值(<code>String</code>、
        <code>Vec</code>)而不是引用(<code>&str</code>、<code>&[T]</code>)</strong>。代价是一次拷贝/移动,
        但省去所有生命周期烦恼。初学阶段这是完全合理的选择。
      </Callout>

      <Compare
        jsTitle="JS:没有这个概念"
        rustTitle="Rust:编译期追踪引用寿命"
        js={`// JS 靠 GC,引用想活多久活多久
function makeRef(obj) {
  return { ref: obj };  // 随便存,GC 兜底
}
// 代价:运行时开销 + 不确定的回收时机`}
        rust={`// Rust 没有 GC,改由编译期生命周期保证安全
struct Holder<'a> { ref_: &'a str }
// 编译器确保 Holder 活着时,被引用的数据一定还在
// 代价:你偶尔要写 'a,但零运行时开销`}
        note="这是同一枚硬币的两面:JS 用运行时 GC 换「不用想」,Rust 用编译期生命周期换「零开销 + 绝对安全」。"
      />

      <Quiz
        question="关于生命周期标注 'a,下面哪个说法是正确的?"
        options={[
          { text: "写上 'a 可以让引用活得更久,避免被释放" },
          { text: "'a 只是描述多个引用之间的寿命关系,帮编译器验证安全性,不产生任何运行时代码也不延长寿命", correct: true },
          { text: "每个函数都必须手动写生命周期标注" },
          { text: "生命周期会在运行时检查引用是否有效" },
        ]}
        explain={
          <>
            <code>'a</code> 是纯<strong>编译期</strong>的描述性标注,类似类型:它陈述「这些引用的寿命满足某种关系」,
            编译器据此做检查,但<strong>不延长任何东西的寿命</strong>,也没有运行时成本。绝大多数函数靠「省略规则」
            自动推断,无需手写。
          </>
        }
      />

      <h2>报错训练</h2>
      <ErrorDrill
        code={`fn main() {
    let r;
    {
        let s = String::from("hi");
        r = &s;
    }
    println!("{}", r);
}`}
        error={`error[E0597]: \`s\` does not live long enough
 --> src/main.rs:5:13
  |
4 |         let s = String::from("hi");
  |             - binding \`s\` declared here
5 |         r = &s;
  |             ^^ borrowed value does not live long enough
6 |     }
  |     - \`s\` dropped here while still borrowed
7 |     println!("{}", r);
  |                    - borrow later used here`}
        question="`does not live long enough` 在说什么?"
        options={[
          { text: 'r 借用了内层作用域里的 s,但 s 在内层 } 处就被 drop;r 却在外层还要用 —— 引用比数据活得久(悬垂)', correct: true },
          { text: 'r 没有被初始化就使用了' },
          { text: 'String 类型不允许被借用' },
          { text: '缺少 \'static 生命周期标注,加上就行' },
        ]}
        explain={
          <>
            核心规则:<strong>引用不能比它指向的数据活得久</strong>。<code>s</code> 在内层花括号结束就没了,
            而 <code>r</code> 想活到 <code>println!</code>。修法不是硬加 <code>'static</code>,而是让数据活得够久——
            把 <code>s</code> 提到外层作用域,或让 <code>r</code> 直接持有 <code>String</code>(拥有所有权)而非借用。
          </>
        }
      />

      <Callout kind="info" title="本章要点 & 下一步">
        ① 生命周期 = 引用有效的时间区间;② 核心规则:引用不能比数据活得久;③ 多数情况编译器自动省略,
        只有「返回引用且来源不明」时才需手写 <code>'a</code>;④ <code>'a</code> 只描述、不延长;⑤ 嫌烦就持有所有权。
        下一章看异步与并发里这些规则如何继续护航。
      </Callout>
    </>
  )
}

import CodeBlock from '../../components/CodeBlock'
import { Callout, Compare, KeyTerm, Quiz, Figure } from '../../components/Ui'
import { MicroLab } from '../../components/Lab'
import Flow from '../../components/viz/Flow'

export default function ErrorHandling() {
  return (
    <>
      <p>
        在 JS 里,函数可能抛异常,但<strong>类型签名看不出来</strong>——你不读文档/源码,根本不知道
        <code>JSON.parse</code> 会扔。Rust 反过来:<strong>错误是普通的返回值</strong>,写在类型里,
        编译器逼你处理。这一章你会发现「错误处理」可以既严谨又优雅。
      </p>

      <h2>两类错误:能恢复 vs 不能恢复</h2>
      <ul>
        <li><strong>可恢复错误</strong>(文件不存在、网络超时、解析失败)→ 返回 <code>Result&lt;T, E&gt;</code>,让调用者决定怎么办。</li>
        <li><strong>不可恢复错误</strong>(数组越界、断言失败这种「程序写错了」)→ <code>panic!</code>,直接终止。类比 JS 里你不会去 catch 的那种逻辑 bug。</li>
      </ul>

      <KeyTerm term="Result:错误是一个值" en="Result<T, E>" analogy="把 try/catch 的「成功路径」和「失败路径」合并成一个返回值,调用方必须显式处理。">
        <code>Result</code> 也是个枚举,两个变体:
        <CodeBlock code={`enum Result<T, E> {
    Ok(T),    // 成功,带着结果 T
    Err(E),   // 失败,带着错误 E
}`} />
        函数返回 <code>Result</code> 就等于在类型上宣告「我可能失败」,调用者不处理就编译不过。
      </KeyTerm>

      <h2>对比:try/catch vs Result</h2>
      <Compare
        js={`function parse(s) {
  // 签名看不出会不会抛
  return JSON.parse(s);
}
try {
  const data = parse(input);
  use(data);
} catch (e) {
  console.error("失败了", e);
}`}
        rust={`fn parse(s: &str) -> Result<Data, Error> {
    // 类型直接写明:可能 Err
    serde_json::from_str(s)
}
match parse(input) {
    Ok(data) => use_data(data),
    Err(e) => eprintln!("失败了 {e}"),
}`}
        note="JS 的异常是「隐式控制流」,可能从任意深处冒出来;Rust 把失败变成显式的值,流程一目了然,也不会忘记处理。"
      />

      <h2>? 运算符:错误处理的「自动挡」</h2>
      <p>
        如果每一步都写 <code>match</code> 来传播错误,会很冗长。Rust 提供 <code>?</code>:
        <strong>成功就解包继续,失败就提前 return 这个错误</strong>。一个符号顶一段样板代码:
      </p>
      <Compare
        js={`async function load() {
  // 手动 try/catch 或让它向上冒泡
  const res = await fetch(url);
  const text = await res.text();
  const data = JSON.parse(text);
  return data;
}`}
        rust={`fn load() -> Result<Data, Error> {
    let text = read_file("data.json")?; // 失败就 return Err
    let data = parse(&text)?;           // 失败就 return Err
    Ok(data)                            // 全成功才到这
}`}
        note="每个 ? 都是一个「成功则继续、失败则短路返回」的检查点。比 JS 的 try/catch 更细粒度,且不会漏掉任何一步。"
      />

      <Figure title="? 运算符的控制流" caption="? 把「成功解包 / 失败提前返回」这套逻辑压缩成一个字符,链式调用时尤其清爽。">
        <Flow
          width={680}
          height={170}
          nodes={[
            { id: 'call', x: 20, y: 60, w: 130, label: 'foo()?', sub: '调用并解包', tone: 'rust' },
            { id: 'check', x: 200, y: 55, w: 120, h: 60, label: 'Ok 还是 Err?', tone: 'info', shape: 'diamond' },
            { id: 'ok', x: 380, y: 20, w: 150, label: '取出 Ok 里的值', sub: '继续往下执行', tone: 'ok' },
            { id: 'err', x: 380, y: 105, w: 180, label: 'return Err(e)', sub: '立即退出当前函数', tone: 'warn' },
          ]}
          edges={[
            { from: 'call', to: 'check' },
            { from: 'check', to: 'ok', label: 'Ok' },
            { from: 'check', to: 'err', label: 'Err' },
          ]}
        />
      </Figure>

      <h2>unwrap / expect:方便但危险</h2>
      <p>
        你会在很多示例里看到 <code>.unwrap()</code>:它「赌这次一定成功」,成功就取值,
        失败就 <code>panic</code> 崩溃。适合写原型/demo,<strong>生产代码慎用</strong>:
      </p>
      <CodeBlock
        code={`let n: i32 = "42".parse().unwrap();        // 成功,n = 42
let bad: i32 = "abc".parse().unwrap();     // 💥 panic!程序崩溃

// expect 一样会崩,但能附带说明,排查更友好
let port: u16 = env_var.parse()
    .expect("PORT 必须是数字");

// 更稳妥:用 ? 传播,或 match / unwrap_or 给默认值
let count: i32 = input.parse().unwrap_or(0); // 失败就用 0`}
      />
      <Callout kind="danger" title="unwrap 是「未处理的炸弹」">
        每个 <code>unwrap()</code> 都是一个潜在的崩溃点,相当于 JS 里「确信不会出错」而裸调用。
        Code review 时看到生产代码里的 <code>unwrap</code> 要警觉——优先用 <code>?</code>、
        <code>unwrap_or</code>、<code>match</code> 妥善处理。
      </Callout>

      <h2>Option vs Result:什么时候用哪个?</h2>
      <Callout kind="rust">
        <strong>Option&lt;T&gt;</strong> 表达「<strong>可能没有</strong>」(没有额外原因,如查找未命中);
        <strong>Result&lt;T, E&gt;</strong> 表达「<strong>可能失败,且失败有原因 E</strong>」(如解析错误、IO 错误)。
        两者都能用 <code>?</code> 传播,都能 <code>match</code> 解包。
      </Callout>

      <Quiz
        question="函数里写 let data = fetch(url)?; 这个 ? 的作用是?"
        options={[
          { text: '如果 fetch 返回 Ok,取出里面的值赋给 data;如果返回 Err,立即让当前函数返回那个 Err', correct: true },
          { text: '把 fetch 变成异步调用' },
          { text: '忽略 fetch 的错误,继续执行' },
          { text: '如果出错就 panic 崩溃' },
        ]}
        explain={
          <>
            <code>?</code> 是「成功解包 / 失败短路返回」的语法糖,既不忽略错误也不崩溃,而是把错误
            <strong>向上传播</strong>给调用者。要用 <code>?</code>,当前函数的返回类型也得是 <code>Result</code>(或 <code>Option</code>)。
          </>
        }
      />

      <h2>动手练习</h2>
      <MicroLab
        title="把 unwrap 改成 Result + ?"
        minutes={8}
        goal={
          <>
            下面的 <code>parse_sum</code> 用了两个 <code>unwrap()</code>,遇到非数字就 panic。把它改成返回
            <code>Result</code> 并用 <code>?</code> 传播错误,让 <code>main</code> 能<strong>优雅地</strong>分别处理
            成功与失败两种输入(而不是崩溃)。
          </>
        }
        starter={`fn parse_sum(a: &str, b: &str) -> i32 {
    a.parse::<i32>().unwrap() + b.parse::<i32>().unwrap()
}

fn main() {
    println!("和 = {}", parse_sum("3", "5"));
    println!("和 = {}", parse_sum("3", "x")); // 这一行现在会 panic
}`}
        hint={
          <>
            ① 把返回类型改成 <code>Result&lt;i32, std::num::ParseIntError&gt;</code>;
            ② 把两个 <code>.unwrap()</code> 换成 <code>?</code>;③ 函数最后用 <code>Ok(...)</code> 包住结果;
            ④ <code>main</code> 里用 <code>match</code> 分别处理 <code>Ok</code> / <code>Err</code>。
          </>
        }
        solution={`fn parse_sum(a: &str, b: &str) -> Result<i32, std::num::ParseIntError> {
    Ok(a.parse::<i32>()? + b.parse::<i32>()?)
}

fn main() {
    for (a, b) in [("3", "5"), ("3", "x")] {
        match parse_sum(a, b) {
            Ok(n) => println!("和 = {n}"),
            Err(e) => println!("解析失败: {e}"),
        }
    }
}`}
        expectedOutput={`和 = 8
解析失败: invalid digit found in string`}
      />

      <Callout kind="info" title="本章要点 & 下一步">
        ① 错误是值(<code>Result</code>),写在类型里;② <code>?</code> 优雅地传播错误;③ <code>unwrap</code> 方便但会崩,生产慎用;
        ④ Option 管「空」、Result 管「错」。接下来进入抽象的世界:trait 与泛型,看 Rust 如何做「零成本」的接口与复用。
      </Callout>
    </>
  )
}

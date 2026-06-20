import CodeBlock from '../../components/CodeBlock'
import { Callout, Compare, KeyTerm, Quiz, Figure } from '../../components/Ui'
import { MicroLab } from '../../components/Lab'
import IteratorViz from '../../components/viz/IteratorViz'

export default function Iterators() {
  return (
    <>
      <p>
        这一章你会有「回家」的感觉:Rust 的迭代器就是你天天用的 <code>map</code> /
        <code>filter</code> / <code>reduce</code> 链式调用。区别是——Rust 的版本是<strong>惰性</strong>且
        <strong>零成本</strong>的:写得像高级 API,跑得像手写 for 循环。
      </p>

      <h2>Vec:对应 JS 的 Array</h2>
      <p>前面提过,定长数组用 <code>[T; N]</code>,而<strong>可增长</strong>的动态数组是 <code>Vec&lt;T&gt;</code>,它才是 JS Array 的真正对应物:</p>
      <Compare
        js={`const nums = [1, 2, 3];
nums.push(4);
nums.length;       // 4
nums[0];           // 1`}
        rust={`let mut nums = vec![1, 2, 3];
nums.push(4);
nums.len();        // 4
nums[0];           // 1`}
        note="vec! 宏快速创建;.push / .len / 下标访问都很眼熟。下标越界在 Rust 会 panic(而非返回 undefined),想安全访问用 nums.get(i) 拿 Option。"
      />

      <h2>链式调用:你已经会了</h2>
      <Compare
        js={`const result = [1, 2, 3, 4, 5]
  .filter(x => x % 2 === 0)
  .map(x => x * x)
  .reduce((a, b) => a + b, 0);
// 20`}
        rust={`let result: i32 = (1..=5)
    .filter(|x| x % 2 == 0)
    .map(|x| x * x)
    .sum();
// 20`}
        note="几乎一对一翻译!|x| ... 是闭包(箭头函数)。最大区别:JS 每一步都生成一个新数组,Rust 整条链只遍历一次、不产生中间数组。"
      />

      <KeyTerm term="惰性求值" en="lazy evaluation" analogy="JS 的 .map().filter() 会立刻各跑一遍生成中间数组;Rust 的适配器在被「消费」前什么都不做。">
        <code>map</code>、<code>filter</code> 这类叫<strong>迭代器适配器</strong>,它们只是「搭好管道」,
        不会立刻执行。直到遇到 <strong>消费者</strong>(<code>sum</code>、<code>collect</code>、<code>for</code> 等)
        才真正开始拉取数据,而且<strong>每个元素一次性走完整条链</strong>。下面这个动画把这个过程画出来了:
      </KeyTerm>

      <Figure
        title="动画:惰性迭代器流水线"
        caption="表达式 (1..=5).filter(|x| x%2==0).map(|x| x*x).sum()。逐步观察:奇数在 filter 处被丢弃,偶数一路走到 sum,全程只遍历一次。"
      >
        <IteratorViz />
      </Figure>

      <Callout kind="warn" title="忘了消费 = 什么都没发生">
        因为是惰性的,只写 <code>{'v.iter().map(|x| println!("{x}"))'}</code> 而不消费它,
        <strong>一行都不会打印</strong>!编译器会警告你「这个迭代器没被使用」。需要立即执行副作用时,
        用 <code>for</code> 循环或 <code>.for_each(...)</code>。
      </Callout>

      <h2>三种 iter:谁拿走所有权?</h2>
      <p>这是迭代器里最该搞清楚的一点,和「所有权」直接挂钩:</p>
      <CodeBlock
        title="iter / iter_mut / into_iter"
        code={`let v = vec![1, 2, 3];

v.iter()        // 产出 &T(借用,只读)—— v 之后还能用
v.iter_mut()    // 产出 &mut T(可变借用)—— 可原地修改元素
v.into_iter()   // 产出 T(拿走所有权)—— v 被消耗,之后不能再用

// for 循环的默认行为:
for x in &v { }      // 等价 v.iter(),借用
for x in &mut v { }  // 等价 v.iter_mut()
for x in v { }       // 等价 v.into_iter(),把 v 吃掉`}
      />
      <Callout kind="rust" title="记忆法">
        <code>&v</code> = 借来读,<code>&mut v</code> = 借来改,<code>v</code> = 直接拿走。
        和第 4、5 章的所有权/借用规则完全一致——迭代器只是它们的应用。
      </Callout>

      <h2>collect:把结果收集回集合</h2>
      <p>消费者 <code>collect</code> 把迭代器「收」成一个集合。常需告诉它收成什么类型:</p>
      <CodeBlock
        runnable
        code={`fn main() {
    // 收集成 Vec(用 turbofish ::<> 或类型标注指定目标类型)
    let doubled: Vec<i32> = (1..=5).map(|x| x * 2).collect();
    println!("{:?}", doubled);

    // 收集成 String
    let word: String = vec!['r', 'u', 's', 't'].into_iter().collect();
    println!("{word}");

    // enumerate:同时拿到索引(像 JS 的 entries / forEach 第二参)
    for (i, c) in "abc".chars().enumerate() {
        println!("{i}: {c}");
    }
}`}
        output={`[2, 4, 6, 8, 10]
rust
0: a
1: b
2: c`}
      />

      <h2>常用适配器/消费者速查</h2>
      <div className="prose">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--rust)' }}>
              <th style={c}>JS</th><th style={c}>Rust</th><th style={c}>说明</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['.map()', '.map()', '逐个变换'],
              ['.filter()', '.filter()', '按条件保留'],
              ['.reduce()', '.fold(init, f)', '折叠累计'],
              ['.find()', '.find()', '找第一个匹配,返回 Option'],
              ['.some()', '.any()', '是否存在满足条件的'],
              ['.every()', '.all()', '是否全部满足'],
              ['.forEach()', '.for_each()', '逐个执行副作用'],
              ['.slice() / 取前 N', '.take(n) / .skip(n)', '惰性截取'],
              ['.flat()', '.flatten()', '展平嵌套'],
              ['Array.from + 索引', '.enumerate()', '带索引迭代'],
            ].map((r) => (
              <tr key={r[0]} style={{ borderTop: '1px solid var(--line)' }}>
                <td style={c}><code>{r[0]}</code></td>
                <td style={c}><code style={{ color: 'var(--rust)' }}>{r[1]}</code></td>
                <td style={{ ...c, color: 'var(--fg-2)' }}>{r[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Quiz
        question="下面这行 Rust 代码运行后会打印什么?"
        options={[
          { text: '打印 1 2 3' },
          { text: '什么都不打印,并且编译器会警告迭代器未被使用', correct: true },
          { text: '打印 [1, 2, 3]' },
          { text: '编译错误,无法编译' },
        ]}
        explain={
          <>
            <CodeBlock code={`vec![1, 2, 3].iter().map(|x| println!("{x}"));`} />
            <code>map</code> 是惰性适配器,没有消费者去「拉」它,闭包一次都不会执行。Rust 会给出
            <code>unused `Map` that must be used</code> 警告。要真正打印,用
            <code>{'.for_each(|x| println!("{x}"))'}</code> 或 <code>for</code> 循环。
          </>
        }
      />

      <h2>动手练习</h2>
      <MicroLab
        title="把 for 循环改写成迭代器链"
        minutes={6}
        goal={
          <>
            下面用 <code>for</code> 循环 + 可变累加器求「<code>1..=10</code> 里所有偶数的平方和」。
            把它<strong>改写成一行</strong>迭代器链(<code>filter</code> → <code>map</code> → <code>sum</code>),
            输出不变(应为 <code>220</code>)。
          </>
        }
        starter={`fn main() {
    let mut sum = 0;
    for x in 1..=10 {
        if x % 2 == 0 {
            sum += x * x;
        }
    }
    println!("{sum}");
}`}
        hint={
          <>
            形如 <code>{'(1..=10).filter(|x| x % 2 == 0).map(|x| x * x).sum()'}</code>。
            <code>sum</code> 需要知道结果类型,给它标注 <code>{'let sum: i32 = ...'}</code> 即可。
          </>
        }
        solution={`fn main() {
    let sum: i32 = (1..=10)
        .filter(|x| x % 2 == 0)
        .map(|x| x * x)
        .sum();
    println!("{sum}");
}`}
        expectedOutput={`220`}
      />

      <Callout kind="info" title="本章要点 & 下一步">
        ① <code>Vec</code> 对应 JS Array;② 链式迭代器语法与 JS 几乎一致,但惰性且零成本;
        ③ <code>iter / iter_mut / into_iter</code> 对应借用/可变借用/拿走所有权;④ <code>collect</code> 收集结果。
        下一章把前端离不开的 <code>Map</code> / <code>Set</code> / <code>Object</code> 在 Rust 里的对应物补齐——HashMap 与 HashSet。
      </Callout>
    </>
  )
}

const c = { padding: '7px 10px', verticalAlign: 'top' } as const

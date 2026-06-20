import CodeBlock from '../../components/CodeBlock'
import { Callout, Compare, KeyTerm, Quiz, Figure } from '../../components/Ui'
import { ErrorDrill, MicroLab } from '../../components/Lab'
import BorrowViz from '../../components/viz/BorrowViz'

export default function Borrowing() {
  return (
    <>
      <p>
        上一章我们看到:把值传进函数,所有权就被「拿走」了。每次都还回来太麻烦。
        解决办法是<strong>借用(borrowing)</strong>:创建一个<strong>引用(reference)</strong>,
        让别人「借看一下」而不夺走所有权。这一章你会理解 Rust 最有名的守门员——<strong>借用检查器</strong>。
      </p>

      <h2>引用:&T 借出,不转移所有权</h2>
      <Compare
        js={`// JS 对象本来就是按引用传递
function len(s) {
  return s.length;
}
const s = "hello";
len(s);            // s 之后照样能用`}
        rust={`fn len(s: &String) -> usize {  // & 表示借用
    s.len()
}
let s = String::from("hello");
len(&s);           // 传引用 &s
println!("{s}");   // ✅ 所有权没动,s 还在`}
        note="& 创建引用(借用),函数用完借用就结束,所有权始终在 s 手里。这正是上一章「啰嗦地还来还去」的优雅替代。"
      />

      <h2>两种借用:只读 vs 可写</h2>
      <ul>
        <li><code>&T</code> —— <strong>不可变借用</strong>(共享借用),只能读。可以同时有很多个。</li>
        <li><code>&mut T</code> —— <strong>可变借用</strong>(独占借用),能改。同一时刻只能有一个,且不能与任何只读借用共存。</li>
      </ul>
      <CodeBlock
        runnable
        title="可变借用要改数据"
        code={`fn main() {
    let mut s = String::from("hello");
    append(&mut s);          // 借出可变引用
    println!("{s}");
}

fn append(s: &mut String) { // 接收可变引用
    s.push_str(", world");
}`}
        output={`hello, world`}
      />

      <h2>核心规则:互斥的「读」与「写」</h2>
      <p>
        Rust 借用检查器只认一条铁律,切换下面的场景亲手验证它:
      </p>
      <Callout kind="rust" title="借用法则">
        在任意时刻,对同一份数据,要么有<strong>任意多个不可变借用(&)</strong>,
        要么有<strong>唯一一个可变借用(&mut)</strong>。<strong>二者不可同时存在。</strong>
      </Callout>

      <Figure
        title="交互:借用检查器的四种场景"
        caption="切换标签,看哪些组合编译器放行、哪些会报错。橙色实线=可变借用,蓝色=只读借用。"
      >
        <BorrowViz />
      </Figure>

      <h2>为什么这条规则如此重要?</h2>
      <p>
        作为前端,你大概率踩过这个坑:<strong>遍历数组的同时修改它</strong>,导致跳过元素或死循环。
        这本质就是「一边读一边写同一份数据」。JS 放任你这么干,Rust 在编译期直接禁止:
      </p>
      <Compare
        js={`const arr = [1, 2, 3, 4];
for (const x of arr) {
  if (x === 2) arr.push(99); // 一边遍历一边改
}
// 行为诡异 / 可能死循环,运行时才发现`}
        rust={`let mut v = vec![1, 2, 3, 4];
for x in &v {          // &v 借出只读引用
    if *x == 2 {
        v.push(99);    // ❌ 编译错误:
        // cannot borrow \`v\` as mutable
        // because it is also borrowed as immutable
    }
}`}
        note="for 循环正持有 v 的只读借用,你却想拿可变借用去 push——违反铁律,编译期拦下。同样的 bug,Rust 让你根本写不出来。"
      />
      <Callout kind="tip" title="一句话记住">
        这条规则消灭了一整类 bug:<strong>数据竞争</strong>(并发场景)和<strong>迭代器失效</strong>(单线程场景),
        都是「读写打架」。Rust 把它变成编译错误,而不是运行时玄学。
      </Callout>

      <h2>悬垂引用?编译不过</h2>
      <p>
        在 C 里返回一个指向局部变量的指针是经典 bug(函数返回后那块内存就没了)。Rust 用
        <strong>生命周期</strong>分析直接拒绝这种代码:
      </p>
      <CodeBlock
        title="这段无法编译"
        code={`fn dangle() -> &String {     // ❌ 返回一个引用…
    let s = String::from("hi");
    &s                       // …但 s 在函数结束就被 drop 了!
}                            // 引用将指向已释放的内存

// 编译器:missing lifetime specifier / \`s\` does not live long enough
// 正确做法:直接返回 String(把所有权交出去),别返回引用`}
      />

      <KeyTerm term="生命周期" en="lifetime" analogy="可以理解成编译期版的「这个引用保证在这段时间内有效」的契约,大多数时候编译器自动推断,你无需手写。">
        生命周期标注(如 <code>&'a str</code>)告诉编译器「引用能活多久」,确保引用不会比它指向的数据活得更久。
        日常代码里 90% 的场景编译器都能自动推断(称为<strong>生命周期省略</strong>),只有少数复杂签名才要手写。
        初学阶段,记住「引用不能比数据活得久」这个直觉就够了。
      </KeyTerm>

      <h2>切片:借用一部分</h2>
      <p>
        <code>&str</code> 其实就是「<code>String</code> 的一段切片借用」。切片让你引用集合的一部分而不复制:
      </p>
      <CodeBlock
        runnable
        code={`fn main() {
    let s = String::from("hello world");
    let hello: &str = &s[0..5];   // 借用前 5 个字节
    let world: &str = &s[6..11];
    println!("{hello} | {world}");

    let nums = [10, 20, 30, 40, 50];
    let mid: &[i32] = &nums[1..4]; // 数组切片
    println!("{:?}", mid);
}`}
        output={`hello | world
[20, 30, 40]`}
      />

      <Quiz
        question="下面代码能编译吗?"
        options={[
          { text: '能,r1、r2、r3 都是只读借用,可以共存', correct: true },
          { text: '不能,一个变量最多只能被借用一次' },
          { text: '不能,因为 s 不是 mut' },
          { text: '能,但 r3 会报警告' },
        ]}
        explain={
          <>
            <CodeBlock code={`let s = String::from("hi");
let r1 = &s;
let r2 = &s;
let r3 = &s;
println!("{r1} {r2} {r3}");`} />
            全是<strong>不可变借用</strong>,数量不限,因为大家都只读、不会互相干扰。只有当出现
            <code>&mut</code> 时,独占规则才生效。
          </>
        }
      />

      <h2>报错训练</h2>
      <ErrorDrill
        code={`fn main() {
    let mut v = vec![1, 2, 3];
    for x in &v {
        if *x == 2 {
            v.push(99);
        }
    }
}`}
        error={`error[E0502]: cannot borrow \`v\` as mutable because it is also borrowed as immutable
 --> src/main.rs:5:13
  |
3 |     for x in &v {
  |              -- immutable borrow occurs here
4 |         if *x == 2 {
5 |             v.push(99);
  |             ^^^^^^^^^^ mutable borrow occurs here
6 |         }
7 |     }
  |     - immutable borrow later used here`}
        question="编译器到底在拦什么?"
        options={[
          { text: 'for 循环正持有 v 的不可变借用(&v),循环体里又想拿可变借用去 push,违反「读写互斥」', correct: true },
          { text: '因为 v 没有声明成 mut' },
          { text: '因为 vec! 宏的用法不对' },
          { text: '因为 *x 解引用是非法操作' },
        ]}
        explain={
          <>
            <code>for x in &v</code> 在整个循环期间持有 <code>v</code> 的<strong>不可变借用</strong>,
            而 <code>v.push</code> 需要<strong>可变借用</strong>——两者不能共存。这正是「迭代时修改集合」这类经典
            bug,Rust 在编译期直接拦下。下面的练习就来修它。
          </>
        }
      />

      <h2>动手练习</h2>
      <MicroLab
        title="安全地「边遍历边追加」"
        minutes={6}
        goal={
          <>
            把上面会冲突的代码改成能编译、并打印 <code>[1, 2, 3, 99]</code>。
            思路:不要在借用 <code>v</code> 的同时改它。
          </>
        }
        starter={`fn main() {
    let mut v = vec![1, 2, 3];
    for x in &v {
        if *x == 2 {
            v.push(99);   // ❌ 借用冲突
        }
    }
    println!("{:?}", v);
}`}
        hint={
          <>
            一个干净的做法:先遍历<strong>原数据的拷贝/快照</strong>决定要加什么,循环结束后再 push;
            或把要追加的值先收集到另一个 <code>Vec</code>,循环外 <code>extend</code> 进去。
          </>
        }
        solution={`fn main() {
    let mut v = vec![1, 2, 3];
    let mut to_add = vec![];
    for x in &v {                 // 只读借用,循环内不改 v
        if *x == 2 { to_add.push(99); }
    }
    v.extend(to_add);             // 借用结束后再修改
    println!("{:?}", v);
}`}
        expectedOutput={`[1, 2, 3, 99]`}
      />

      <Callout kind="info" title="本章要点 & 下一步">
        ① <code>&</code> 借用不夺走所有权;② 只读借用可多个、可变借用须唯一且互斥;③ 这条规则消灭数据竞争与迭代器失效;
        ④ 引用不能比数据活得久(生命周期)。接下来换换脑子,看怎么用结构体和枚举给数据建模。
      </Callout>
    </>
  )
}

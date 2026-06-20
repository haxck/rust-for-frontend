import CodeBlock from '../../components/CodeBlock'
import { Callout, Compare, KeyTerm, Quiz } from '../../components/Ui'
import { MicroLab } from '../../components/Lab'

export default function Collections() {
  return (
    <>
      <p>
        上一组章节讲了 <code>Vec</code>(≈ Array)。但前端日常还离不开 <code>Object</code> / <code>Map</code> / <code>Set</code>。
        这一章把它们在 Rust 里的对应物一次讲清:<strong>HashMap</strong>、<strong>HashSet</strong>,以及有序版本
        <strong>BTreeMap</strong>。
      </p>

      <h2>HashMap:你的 Map / Object</h2>
      <Compare
        js={`const scores = new Map();
scores.set("Alice", 95);
scores.set("Bob", 80);

scores.get("Alice");      // 95
scores.has("Bob");        // true
scores.delete("Bob");
scores.size;              // 1`}
        rust={`use std::collections::HashMap;

let mut scores = HashMap::new();
scores.insert("Alice", 95);
scores.insert("Bob", 80);

scores.get("Alice");      // Some(&95) —— 注意是 Option!
scores.contains_key("Bob"); // true
scores.remove("Bob");
scores.len();             // 1`}
        note="最大区别:get 返回的是 Option<&V>(可能没有这个键),逼你处理「找不到」的情况——又一次告别 undefined。"
      />

      <Callout kind="rust" title="get 返回 Option,不是值">
        JS 里 <code>map.get(missing)</code> 给你 <code>undefined</code>,一不小心就 <code>undefined.foo</code> 崩了。
        Rust 给你 <code>Option&lt;&V&gt;</code>,必须先解包。配合默认值非常顺手:
        <CodeBlock code={`let alice = scores.get("Alice").copied().unwrap_or(0);
// 或者直接给可变引用并插入默认值:
*scores.entry("Carol").or_insert(0) += 1;`} />
      </Callout>

      <h2>entry API:Rust 最好用的设计之一</h2>
      <p>
        「如果键存在就更新,不存在就插入默认值」——这个在 JS 里要写一坨 <code>if (map.has(k))</code> 的逻辑,
        Rust 用 <code>entry</code> 一行搞定。统计词频的经典例子:
      </p>
      <CodeBlock
        runnable
        title="用 entry 统计词频"
        code={`use std::collections::HashMap;

fn main() {
    let text = "the cat the dog the bird";
    let mut counts: HashMap<&str, i32> = HashMap::new();

    for word in text.split_whitespace() {
        // 没有这个键就插入 0,然后无论如何 +1
        *counts.entry(word).or_insert(0) += 1;
    }

    // 注意:HashMap 遍历顺序是随机的
    let the = counts.get("the").unwrap();
    println!("\\"the\\" 出现了 {the} 次");
}`}
        output={`"the" 出现了 3 次`}
      />
      <Compare
        jsTitle="JS 要手动判断"
        rustTitle="Rust 一行 entry"
        js={`for (const w of words) {
  if (counts.has(w)) {
    counts.set(w, counts.get(w) + 1);
  } else {
    counts.set(w, 1);
  }
}`}
        rust={`for w in words {
    *counts.entry(w).or_insert(0) += 1;
}`}
        note="entry(k).or_insert(default) 返回「该位置值的可变引用」,存在就给你现有的,不存在就先放默认值再给你。"
      />

      <h2>HashSet:你的 Set</h2>
      <Compare
        js={`const seen = new Set();
seen.add(1);
seen.add(1);          // 重复无效
seen.has(1);          // true
seen.size;            // 1`}
        rust={`use std::collections::HashSet;

let mut seen = HashSet::new();
seen.insert(1);
seen.insert(1);       // 返回 false(已存在)
seen.contains(&1);    // true
seen.len();           // 1`}
        note="API 几乎一一对应。insert 还会返回 bool 告诉你是不是新元素,省得先 contains 再 insert。"
      />
      <Callout kind="tip" title="集合运算开箱即用">
        <code>HashSet</code> 自带交集 / 并集 / 差集,比 JS 手写方便:
        <CodeBlock code={`let a: HashSet<i32> = [1, 2, 3].into_iter().collect();
let b: HashSet<i32> = [2, 3, 4].into_iter().collect();
let common: Vec<_> = a.intersection(&b).collect(); // [2, 3]
let all: Vec<_> = a.union(&b).collect();           // [1,2,3,4]`} />
      </Callout>

      <KeyTerm term="BTreeMap / BTreeSet" en="有序版本" analogy="像 JS 里你手动 [...map].sort() 才能得到的有序遍历,但它「天生有序」且查找仍然很快。">
        <code>HashMap</code> 遍历<strong>无序</strong>(为了快)。当你需要<strong>按键排序</strong>遍历时,换成
        <code>BTreeMap</code>——API 几乎一样,代价是单次操作略慢(O(log n) vs O(1)),但遍历自动有序。
        <CodeBlock code={`use std::collections::BTreeMap;
let mut m = BTreeMap::new();
m.insert(3, "c"); m.insert(1, "a"); m.insert(2, "b");
for (k, v) in &m { print!("{k}:{v} "); } // 1:a 2:b 3:c(有序!)`} />
      </KeyTerm>

      <h2>一张对照表收尾</h2>
      <div className="prose">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--rust)' }}>
              <th style={c}>前端</th><th style={c}>Rust</th><th style={c}>说明</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['Array', 'Vec<T>', '动态数组,可 push'],
              ['Map / Object', 'HashMap<K, V>', '键值对,无序,O(1) 查找'],
              ['Set', 'HashSet<T>', '去重集合'],
              ['有序遍历的 Map', 'BTreeMap<K, V>', '按键自动排序'],
              ['map.get(k)', 'map.get(&k) → Option', '找不到返回 None,不是 undefined'],
              ['map.has(k)', 'map.contains_key(&k)', '是否存在键'],
              ['复杂的「有则更新无则插入」', 'map.entry(k).or_insert(d)', '一行原子化处理'],
            ].map((r) => (
              <tr key={r[1]} style={{ borderTop: '1px solid var(--line)' }}>
                <td style={c}><code>{r[0]}</code></td>
                <td style={c}><code style={{ color: 'var(--rust)' }}>{r[1]}</code></td>
                <td style={{ ...c, color: 'var(--fg-2)' }}>{r[2]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Quiz
        question="你想「给某个键的计数 +1,如果键不存在就从 0 开始」。最地道的 Rust 写法是?"
        options={[
          { text: 'if map.contains_key(k) { ... } else { ... } 手动判断' },
          { text: '*map.entry(k).or_insert(0) += 1;', correct: true },
          { text: 'map.set(k, map.get(k) + 1)' },
          { text: 'map[k] += 1; 直接下标自增' },
        ]}
        explain={
          <>
            <code>entry(k).or_insert(0)</code> 返回该位置的<strong>可变引用</strong>:键不存在就先插入 0,
            然后 <code>*... += 1</code> 自增。一步到位,没有竞态、没有重复查找。直接下标 <code>map[k]</code> 读取存在的键可以,
            但对不存在的键会 panic,不能用来「自动初始化」。
          </>
        }
      />

      <h2>动手练习</h2>
      <MicroLab
        title="用 entry 统计词频"
        minutes={6}
        goal={
          <>
            补全 <code>TODO</code> 那一行,用 <code>HashMap</code> 的 <code>entry</code> API 统计每个单词出现次数,
            让它正确打印 <code>a 出现 3 次</code>。
          </>
        }
        starter={`use std::collections::HashMap;

fn main() {
    let text = "a b a c a b";
    let mut counts: HashMap<&str, i32> = HashMap::new();
    for w in text.split_whitespace() {
        // TODO: 让 w 对应的计数 +1(不存在则从 0 开始)
    }
    println!("a 出现 {} 次", counts.get("a").unwrap());
}`}
        hint={
          <>
            一行搞定:<code>{'*counts.entry(w).or_insert(0) += 1;'}</code>。
            <code>entry(w).or_insert(0)</code> 返回该位置的可变引用——不存在就先放 0,再解引用自增。
          </>
        }
        solution={`use std::collections::HashMap;

fn main() {
    let text = "a b a c a b";
    let mut counts: HashMap<&str, i32> = HashMap::new();
    for w in text.split_whitespace() {
        *counts.entry(w).or_insert(0) += 1;
    }
    println!("a 出现 {} 次", counts.get("a").unwrap());
}`}
        expectedOutput={`a 出现 3 次`}
      />

      <Callout kind="info" title="本章要点 & 下一步">
        ① <code>HashMap</code>/<code>HashSet</code> ≈ Map/Set,但 <code>get</code> 返回 <code>Option</code>;
        ② <code>entry</code> API 优雅处理「有则更新无则插入」;③ 需要有序遍历用 <code>BTreeMap</code>。
        到此「语言核心」就全了。接下来进入<strong>进阶</strong>:当单一所有权不够用时,智能指针登场。
      </Callout>
    </>
  )
}

const c = { padding: '7px 10px', verticalAlign: 'top' } as const

/**
 * 调用官方 Rust Playground 的执行 API。
 * 端点带 access-control-allow-origin: *,可直接从浏览器跨域 POST。
 * 注意:用的是官方公共算力,仅供学习用途,不要高频滥用。
 */
const ENDPOINT = 'https://play.rust-lang.org/execute'

export interface ExecuteResult {
  success: boolean
  /** 程序标准输出 */
  stdout: string
  /** 编译器信息 / 程序 stderr(编译错误也在这里) */
  stderr: string
  /** 如 "Exited with status 0" */
  exitDetail?: string
}

export interface ExecuteOptions {
  channel?: 'stable' | 'beta' | 'nightly'
  mode?: 'debug' | 'release'
  edition?: '2015' | '2018' | '2021' | '2024'
}

/** 在源码缺少 fn main 时,猜测它是否需要被包一层(片段直接运行) */
export function looksLikeFullProgram(code: string): boolean {
  return /\bfn\s+main\s*\(/.test(code)
}

export async function runOnPlayground(
  code: string,
  opts: ExecuteOptions = {},
  signal?: AbortSignal,
): Promise<ExecuteResult> {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    signal,
    body: JSON.stringify({
      channel: opts.channel ?? 'stable',
      mode: opts.mode ?? 'debug',
      edition: opts.edition ?? '2024',
      crateType: 'bin',
      tests: false,
      code,
      backtrace: false,
    }),
  })
  if (!res.ok) {
    throw new Error(`Playground 返回 HTTP ${res.status}`)
  }
  return (await res.json()) as ExecuteResult
}

/** 构造「在 Playground 打开」的分享链接(逃生出口) */
export function playgroundUrl(code: string, opts: ExecuteOptions = {}): string {
  const params = new URLSearchParams({
    version: opts.channel ?? 'stable',
    mode: opts.mode ?? 'debug',
    edition: opts.edition ?? '2024',
    code,
  })
  return `https://play.rust-lang.org/?${params.toString()}`
}

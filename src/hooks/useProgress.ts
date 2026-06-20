import { useCallback, useEffect, useState } from 'react'

const KEY = 'rff:completed'

function read(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY)
    return new Set<string>(raw ? JSON.parse(raw) : [])
  } catch {
    return new Set()
  }
}

/** 简单的全局事件,让多个组件实例保持同步 */
const listeners = new Set<() => void>()
function broadcast() {
  listeners.forEach((l) => l())
}

/**
 * 学习进度:已完成章节的 slug 集合,持久化到 localStorage。
 */
export function useProgress() {
  const [completed, setCompleted] = useState<Set<string>>(read)

  useEffect(() => {
    const sync = () => setCompleted(read())
    listeners.add(sync)
    return () => {
      listeners.delete(sync)
    }
  }, [])

  const toggle = useCallback((slug: string) => {
    const next = read()
    if (next.has(slug)) next.delete(slug)
    else next.add(slug)
    localStorage.setItem(KEY, JSON.stringify([...next]))
    broadcast()
  }, [])

  const markDone = useCallback((slug: string) => {
    const next = read()
    if (!next.has(slug)) {
      next.add(slug)
      localStorage.setItem(KEY, JSON.stringify([...next]))
      broadcast()
    }
  }, [])

  return { completed, toggle, markDone }
}

"use client"

import { useState } from 'hono/jsx/hooks'

export const Counter = () => {
  const [count, setCount] = useState(0)

  return (
    <div>
      <p>Counter: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  )
}
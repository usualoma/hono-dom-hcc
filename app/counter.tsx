"use client";

import { useState } from "hono/jsx/hooks";
import { css } from "hono/css";

const getRandomColorCode = () =>
  "#" +
  Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, "0");

export const Counter = () => {
  const [count, setCount] = useState(0);
  const [color, setColor] = useState("black");

  const textClass = css`
    color: ${color};
  `;

  return (
    <div>
      <p class={textClass}>Counter: {count}</p>
      <button
        onClick={() => {
          setCount(count + 1);
          setColor(getRandomColorCode());
        }}
      >
        Increment
      </button>
    </div>
  );
};

"use client";
import { useState } from "react";
import s from "./Reviews.module.css";
export default function Client(p: {
  quote: string;
  name: string;
  role: string;
  prev: string;
  next: string;
}) {
  const [i, setI] = useState(0);
  return (
    <article className={s.card}>
      <svg viewBox="0 0 96 72" aria-hidden="true">
        <path
          d="M4 68V40C4 16 16 4 40 4v16c-11 0-17 6-17 18h17v30H4Zm52 0V40C56 16 68 4 92 4v16c-11 0-17 6-17 18h17v30H56Z"
          fill="currentColor"
        />
      </svg>
      <blockquote>{p.quote}</blockquote>
      <p>
        {p.name}
        <br />
        {p.role}
      </p>
      <div>
        <button aria-label={p.prev} onClick={() => setI((i + 3) % 4)}>
          ←
        </button>
        <span>0{i + 1} / 04</span>
        <button aria-label={p.next} onClick={() => setI((i + 1) % 4)}>
          →
        </button>
      </div>
    </article>
  );
}

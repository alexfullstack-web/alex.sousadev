import { useEffect, useMemo, useState } from 'react';

/*
  Painel de código grande (editor holográfico). Digita o código quando
  o conteúdo muda. Sem animação para quem prefere movimento reduzido.
*/
export default function CodePanel({ file, code, typing = true, cps = 110, className = '', badge = 'ao vivo' }) {
  const total = useMemo(() => code.reduce((n, line) => n + line.reduce((m, [t]) => m + t.length, 0) + 1, 0), [code]);
  const [chars, setChars] = useState(typing ? 0 : total);

  useEffect(() => {
    if (!typing) {
      setChars(total);
      return undefined;
    }
    setChars(0);
    let raf;
    let last = 0;
    const start = performance.now();
    const tick = (now) => {
      if (now - last > 28) {
        last = now;
        const n = Math.min(total, Math.floor(((now - start) / 1000) * cps));
        setChars(n);
        if (n >= total) return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [code, typing, total, cps]);

  let remaining = chars;
  let caretLine = -1;
  const lines = code.map((tokens, li) => {
    const parts = [];
    if (remaining > 0) {
      for (let ti = 0; ti < tokens.length && remaining > 0; ti++) {
        const [text, kind] = tokens[ti];
        const part = text.slice(0, remaining);
        remaining -= part.length;
        parts.push(
          <span key={ti} className={`tok tok--${kind}`}>
            {part}
          </span>
        );
      }
      remaining -= 1;
      caretLine = li;
    }
    return parts;
  });
  const done = chars >= total;

  return (
    <div className={`code-panel ${className}`}>
      <div className="code-panel__bar">
        <span className="code-panel__dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className="code-panel__file">{file}</span>
        <span className="code-panel__badge">
          <span className="code-panel__pulse" aria-hidden="true" />
          {badge}
        </span>
      </div>
      <pre className="code-panel__body" aria-label={`Código de exemplo: ${file}`}>
        <code>
          {lines.map((parts, i) => (
            <span className="code-panel__line" key={i}>
              <span className="code-panel__ln" aria-hidden="true">
                {String(i + 1).padStart(2, ' ')}
              </span>
              <span className="code-panel__text">
                {parts}
                {(i === caretLine || (done && i === code.length - 1)) && <span className="code-panel__caret" aria-hidden="true" />}
              </span>
            </span>
          ))}
        </code>
      </pre>
      <div className="code-panel__scan" aria-hidden="true" />
    </div>
  );
}

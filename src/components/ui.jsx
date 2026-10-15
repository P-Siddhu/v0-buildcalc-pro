// Small shared building blocks: form fields, result "slip" rows, copy button, page intro.
import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';
import { copyToClipboard } from '../lib/clipboard.js';

export function NumberField({ id, label, value, onChange, error, hint, prefix, suffix, placeholder, className = '' }) {
  const hintId = hint && !error ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-muted">
            {prefix}
          </span>
        )}
        <input
          id={id}
          type="text"
          inputMode="decimal"
          autoComplete="off"
          spellCheck={false}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={errorId ?? hintId}
          className={`input ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-10' : ''} ${error ? 'input-error' : ''}`}
        />
        {suffix && (
          <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-muted">
            {suffix}
          </span>
        )}
      </div>
      {hintId && (
        <p id={hintId} className="hint mt-1.5">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1.5 text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function SelectField({ id, label, value, onChange, options, className = '' }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="label">
        {label}
      </label>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)} className="input">
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/** A result row: label ......... value. `big` makes it the headline figure. */
export function SlipRow({ label, value, tone, big = false }) {
  const color = tone === 'danger' ? 'text-danger' : tone === 'accent' ? 'text-accent' : 'text-ink';
  return (
    <div className="slip-row">
      <dt>{label}</dt>
      <dd className={`${color} ${big ? 'font-serif text-2xl font-semibold' : 'text-base'}`}>{value}</dd>
    </div>
  );
}

export function CopyButton({ text, label = 'Copy result', disabled = false, className = '' }) {
  const [state, setState] = useState('idle');
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    const ok = await copyToClipboard(text);
    setState(ok ? 'copied' : 'failed');
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setState('idle'), 2500);
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <button type="button" className={`btn btn-secondary ${className}`} onClick={copy} disabled={disabled}>
        {state === 'copied' ? <Check size={18} aria-hidden="true" /> : <Copy size={18} aria-hidden="true" />}
        {state === 'copied' ? 'Copied' : label}
      </button>
      <span role="status" aria-live="polite" className={state === 'failed' ? 'text-sm text-danger' : 'sr-only'}>
        {state === 'copied' && 'Copied to clipboard'}
        {state === 'failed' && 'Couldn’t copy. Select the text and copy it yourself.'}
      </span>
    </span>
  );
}

export function PageIntro({ title, children, icon: Icon }) {
  return (
    <header className="max-w-3xl">
      {Icon && (
        <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-field bg-accent-soft text-accent-ink">
          <Icon size={22} aria-hidden="true" />
        </span>
      )}
      <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">{title}</h1>
      <p className="mt-3 text-lg leading-7 text-muted">{children}</p>
    </header>
  );
}

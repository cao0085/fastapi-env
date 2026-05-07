// ui.tsx — Button + Chip primitives. Match the V2 wireframe.

import type { ReactNode, MouseEventHandler } from 'react';

export function Button({
  children, onClick, solid, variant,
}: {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  solid?: boolean;
  variant?: 'ghost';
}) {
  const style: React.CSSProperties = {
    border: `1.4px ${variant === 'ghost' ? 'dashed' : 'solid'} var(--ink)`,
    background: solid ? 'var(--ink)' : 'transparent',
    color: solid ? 'var(--paper)' : 'var(--ink)',
    fontFamily: 'var(--sans)',
    fontSize: 13,
    padding: '6px 14px',
    borderRadius: 999,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    cursor: 'pointer',
  };
  return <button style={style} onClick={onClick}>{children}</button>;
}

export function Chip({
  children, on, accent,
}: { children: ReactNode; on?: boolean; accent?: boolean }) {
  const style: React.CSSProperties = {
    border: `1.2px solid ${accent ? 'var(--accent)' : on ? 'var(--ink)' : 'var(--rule-soft)'}`,
    background: on ? 'var(--ink)' : 'transparent',
    color: on ? 'var(--paper)' : accent ? 'var(--accent)' : 'var(--ink-2)',
    fontFamily: 'var(--mono)',
    fontSize: 11,
    letterSpacing: '0.08em',
    padding: '3px 9px',
    borderRadius: 999,
    textTransform: 'uppercase',
    display: 'inline-flex',
    alignItems: 'center',
  };
  return <span style={style}>{children}</span>;
}

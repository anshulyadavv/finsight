'use client';
import { useRef, useState } from 'react';

interface Props {
  children: React.ReactNode;
  href?: string;
  onClick?: () => void;
  style?: React.CSSProperties;
  strength?: number;
  as?: 'a' | 'button' | 'span';
}

export function MagneticLink({ children, href, onClick, style, strength = 0.35, as: Tag = 'a' }: Props) {
  const ref = useRef<HTMLElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [active, setActive] = useState(false);

  const handleMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * strength;
    const dy = (e.clientY - cy) * strength;
    setPos({ x: dx, y: dy });
    setActive(true);
  };

  const handleLeave = () => {
    setPos({ x: 0, y: 0 });
    setActive(false);
  };

  const baseStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'inherit',
    transform: `translate(${pos.x}px, ${pos.y}px)`,
    transition: active
      ? 'transform 0.1s cubic-bezier(0.2,0,0,1)'
      : 'transform 0.4s cubic-bezier(0.2,0,0,1)',
    cursor: 'pointer',
    textDecoration: 'none',
    ...style,
  };

  const props = {
    ref: ref as any,
    style: baseStyle,
    onMouseMove: handleMove,
    onMouseLeave: handleLeave,
    onClick,
    ...(href ? { href } : {}),
  };

  return <Tag {...props}>{children}</Tag>;
}

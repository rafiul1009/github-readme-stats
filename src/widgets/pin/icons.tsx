export function RepoIcon({ color }: { color: string }) {
  return (
    <g fill="none" stroke={color} strokeWidth={1.4}>
      <path d="M2 1.5 H12 A1 1 0 0 1 13 2.5 V13.5 A1 1 0 0 1 12 14.5 H4 A2 2 0 0 1 2 12.5 Z" />
      <line x1="4.5" y1="1.5" x2="4.5" y2="14.5" />
    </g>
  );
}

export function StarIcon({ color }: { color: string }) {
  return (
    <path
      fill={color}
      d="M7 0.5 L8.6 4.4 L13 4.8 L9.6 7.6 L10.6 12 L7 9.6 L3.4 12 L4.4 7.6 L1 4.8 L5.4 4.4 Z"
    />
  );
}

export function ForkIcon({ color }: { color: string }) {
  return (
    <g fill="none" stroke={color} strokeWidth={1.4}>
      <circle cx={3} cy={2.5} r={1.6} />
      <circle cx={3} cy={12.5} r={1.6} />
      <circle cx={11} cy={5} r={1.6} />
      <line x1={3} y1={4.1} x2={3} y2={10.9} />
      <path d="M3 10.9 C3 8 6 6.6 8 6.6 L11 6.6" />
    </g>
  );
}

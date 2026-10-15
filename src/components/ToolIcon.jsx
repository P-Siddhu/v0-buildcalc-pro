import { Percent, Ruler, Wallet } from 'lucide-react';

const ICONS = { Wallet, Percent, Ruler };

export default function ToolIcon({ name, size = 22 }) {
  const Icon = ICONS[name] ?? Wallet;
  return <Icon size={size} aria-hidden="true" />;
}

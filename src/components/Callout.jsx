import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';

const TONES = {
  info: { box: 'border-accent/30 bg-accent-soft text-accent-ink', Icon: Info },
  success: { box: 'border-accent/30 bg-accent-soft text-accent-ink', Icon: CheckCircle2 },
  warn: { box: 'border-warn/30 bg-warn-soft text-warn', Icon: AlertTriangle },
  danger: { box: 'border-danger/30 bg-danger-soft text-danger', Icon: AlertTriangle },
};

export default function Callout({ tone = 'info', title, children, className = '', role }) {
  const { box, Icon } = TONES[tone] ?? TONES.info;
  return (
    <div role={role ?? (tone === 'danger' ? 'alert' : 'note')} className={`flex gap-3 rounded-card border p-4 text-sm leading-6 ${box} ${className}`}>
      <Icon size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
      <div className="min-w-0">
        {title && <p className="font-semibold">{title}</p>}
        <div className={title ? 'mt-1' : ''}>{children}</div>
      </div>
    </div>
  );
}

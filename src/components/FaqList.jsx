import { ChevronDown } from 'lucide-react';

/** Native <details>: keyboard accessible and works without extra scripts. */
export default function FaqList({ items }) {
  return (
    <div className="divide-y divide-line rounded-card border border-line bg-surface">
      {items.map((item) => (
        <details key={item.q} className="group px-5">
          <summary className="flex min-h-[56px] cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium text-ink [&::-webkit-details-marker]:hidden">
            <span>{item.q}</span>
            <ChevronDown size={20} className="shrink-0 text-muted transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <div className="pb-5 text-base leading-7 text-muted">{item.a}</div>
        </details>
      ))}
    </div>
  );
}

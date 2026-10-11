export default function Logo({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg width="32" height="32" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
        <rect width="64" height="64" rx="14" className="fill-accent" />
        <circle cx="32" cy="17" r="5" className="fill-on-accent" />
        <rect x="14" y="28" width="36" height="6" rx="3" className="fill-on-accent" />
        <circle cx="32" cy="47" r="5" className="fill-on-accent" />
      </svg>
      <span className="font-serif text-xl font-semibold tracking-tight text-ink">EverydayCalc</span>
    </span>
  );
}

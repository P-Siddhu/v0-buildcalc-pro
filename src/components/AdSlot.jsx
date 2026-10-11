import { site } from '../config/site.js';

/**
 * Reserved place for a future advertisement. Renders nothing while `site.adsEnabled` is false,
 * and no advertising script is included anywhere. See README → "Advertising" before enabling.
 */
export default function AdSlot({ id = 'ad-slot' }) {
  if (!site.adsEnabled) return null;
  return (
    <aside aria-label="Advertisement" className="my-10">
      <p className="mb-1 text-xs text-muted">Advertisement</p>
      <div id={id} className="min-h-[90px] rounded-card border border-dashed border-line" />
    </aside>
  );
}

import { Link } from 'react-router-dom';
import Logo from './Logo.jsx';
import { tools } from '../config/tools.js';
import { site } from '../config/site.js';

const linkClass = 'rounded-sm py-1 text-sm text-muted hover:text-ink hover:underline';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-surface">
      <div className="wrap grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-3 max-w-xs text-sm leading-6 text-muted">{site.tagline}</p>
          <p className="mt-3 max-w-xs text-sm leading-6 text-muted">
            Calculators give general information. They are not financial, tax, legal or investment advice.
          </p>
        </div>
        <nav aria-label="Tools">
          <h2 className="font-sans text-sm font-semibold text-ink">Free tools</h2>
          <ul className="mt-3 flex flex-col">
            {tools.map((t) => (
              <li key={t.id}>
                <Link className={linkClass} to={t.path}>
                  {t.title}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Services and company">
          <h2 className="font-sans text-sm font-semibold text-ink">Services</h2>
          <ul className="mt-3 flex flex-col">
            <li><Link className={linkClass} to="/services">Pricing and scope</Link></li>
            <li><Link className={linkClass} to="/order">Order or enquire</Link></li>
            <li><Link className={linkClass} to="/about">About</Link></li>
            <li><Link className={linkClass} to="/contact">Contact</Link></li>
          </ul>
        </nav>
        <nav aria-label="Legal">
          <h2 className="font-sans text-sm font-semibold text-ink">Legal</h2>
          <ul className="mt-3 flex flex-col">
            <li><Link className={linkClass} to="/privacy">Privacy notice</Link></li>
            <li><Link className={linkClass} to="/terms">Terms of use</Link></li>
          </ul>
        </nav>
      </div>
      <div className="border-t border-line">
        <div className="wrap py-5 text-sm text-muted">© {new Date().getFullYear()} EverydayCalc</div>
      </div>
    </footer>
  );
}

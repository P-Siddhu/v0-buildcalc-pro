import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import Logo from './Logo.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import { navLinks } from '../config/site.js';

const desktopLink = ({ isActive }) =>
  `rounded-field px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-accent-soft text-accent-ink' : 'text-ink hover:bg-sunken'
  }`;
const mobileLink = ({ isActive }) =>
  `flex min-h-[48px] items-center rounded-field px-3 text-base font-medium ${
    isActive ? 'bg-accent-soft text-accent-ink' : 'text-ink hover:bg-sunken'
  }`;

export default function Header() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-canvas/90 shadow-sm backdrop-blur-md">
      <div className="wrap flex h-16 items-center justify-between gap-3">
        <Link to="/" className="rounded-field" aria-label="EverydayCalc home">
          <Logo />
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} className={desktopLink}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <Link to="/order?service=pdf-report" className="btn btn-primary hidden lg:inline-flex">
            Get a custom report
          </Link>
          <button
            type="button"
            className="btn btn-ghost h-11 w-11 !px-0 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="ec-pop border-t border-line bg-surface lg:hidden">
          <div className="wrap flex flex-col gap-1 py-3">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} className={mobileLink}>
                {link.label}
              </NavLink>
            ))}
            <NavLink to="/contact" className={mobileLink}>
              Contact
            </NavLink>
            <Link to="/order?service=pdf-report" className="btn btn-primary mt-2">
              Get a custom report
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}

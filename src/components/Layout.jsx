import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import ScrollManager from './ScrollManager.jsx';
import { useSeo } from '../hooks/useSeo.js';

function PageFallback() {
  return (
    <div className="wrap py-24 text-center text-muted" role="status">
      Loading…
    </div>
  );
}

export default function Layout() {
  useSeo();
  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[60] focus:rounded-field focus:bg-accent focus:px-4 focus:py-2 focus:text-on-accent"
      >
        Skip to main content
      </a>
      <Header />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
      <ScrollManager />
    </div>
  );
}

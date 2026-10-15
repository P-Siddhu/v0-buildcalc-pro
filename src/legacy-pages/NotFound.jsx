import { Link } from 'react-router-dom';
import { tools } from '../config/tools.js';

export default function NotFound() {
  return (
    <div className="wrap py-20 text-center">
      <p className="font-serif text-6xl font-semibold text-accent">404</p>
      <h1 className="mt-4 text-3xl font-semibold">This page doesn’t exist</h1>
      <p className="mx-auto mt-3 max-w-md text-muted">The link may be old or mistyped. These are the pages that do exist:</p>
      <ul className="mx-auto mt-6 flex max-w-md flex-col gap-2">
        {tools.map((t) => (
          <li key={t.id}>
            <Link to={t.path} className="btn btn-secondary w-full">
              {t.title}
            </Link>
          </li>
        ))}
        <li>
          <Link to="/" className="btn btn-primary w-full">
            Back to the homepage
          </Link>
        </li>
      </ul>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { tools } from '../config/tools.js';
import ToolIcon from './ToolIcon.jsx';

export default function RelatedTools({ currentId }) {
  const others = tools.filter((t) => t.id !== currentId);
  return (
    <section aria-labelledby="related-heading" className="mt-14">
      <h2 id="related-heading" className="text-2xl font-semibold">
        More free tools
      </h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {others.map((tool) => (
          <li key={tool.id}>
            <Link to={tool.path} className="card flex items-start gap-3 p-4 transition-colors hover:border-accent">
              <span className="mt-0.5 text-accent">
                <ToolIcon name={tool.icon} size={20} />
              </span>
              <span>
                <span className="block font-semibold text-ink">{tool.title}</span>
                <span className="block text-sm text-muted">{tool.blurb}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

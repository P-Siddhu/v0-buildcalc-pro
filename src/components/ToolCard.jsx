import { Link } from 'react-router-dom';
import ToolIcon from './ToolIcon.jsx';

export default function ToolCard({ tool }) {
  return (
    <Link
      to={tool.path}
      className="card group flex h-full flex-col gap-3 p-5 transition-colors hover:border-accent"
    >
      <span className="inline-flex h-11 w-11 items-center justify-center rounded-field bg-accent-soft text-accent-ink">
        <ToolIcon name={tool.icon} />
      </span>
      <span className="font-serif text-xl font-semibold text-ink group-hover:text-accent">{tool.title}</span>
      <span className="text-sm leading-6 text-muted">{tool.blurb}</span>
      <span className="mt-auto pt-1 text-sm font-medium text-accent">Free · no sign-up</span>
    </Link>
  );
}

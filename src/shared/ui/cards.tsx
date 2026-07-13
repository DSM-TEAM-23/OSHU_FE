import type { ComponentType } from 'react';
import type { LucideProps } from 'lucide-react';

export function SummaryCard({
  title,
  value,
  detail,
  icon: Icon,
}: {
  title: string;
  value: string;
  detail: string;
  icon: ComponentType<LucideProps>;
}) {
  return (
    <article className="summary-card">
      <div className="summary-icon"><Icon size={20} /></div>
      <span>{title}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}

export function QuickAction({
  icon: Icon,
  title,
  detail,
  onClick,
}: {
  icon: ComponentType<LucideProps>;
  title: string;
  detail: string;
  onClick: () => void;
}) {
  return (
    <button className="quick-action" onClick={onClick}>
      <Icon size={22} />
      <strong>{title}</strong>
      <span>{detail}</span>
    </button>
  );
}

import { cn } from '../../utils/helpers';
import { statusColors } from '../../utils/helpers';

export default function Badge({ children, status, className }) {
  const colorClass = status ? statusColors[status] || 'bg-gray-100 text-gray-700' : '';
  return (
    <span className={cn('badge', colorClass, className)}>
      {children}
    </span>
  );
}

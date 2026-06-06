import { statusLabels } from '../../constants/orderLabels';
import type { OrderStatus } from '../../types/orders';

export function StatusBadge({ status }: { status: OrderStatus }) {
  const className =
    status === 'CANCELLED' || status === 'DENIED'
      ? 'badge-snow'
      : status === 'COMPLETED'
        ? 'badge-forest'
        : status === 'SENT'
          ? 'badge-cranberry'
          : 'badge-deer';

  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${className}`}>{statusLabels[status]}</span>;
}

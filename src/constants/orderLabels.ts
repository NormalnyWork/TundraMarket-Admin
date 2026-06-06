import type { OrderStatus } from '../types/orders';

export const statusLabels: Record<OrderStatus, string> = {
  CREATED: 'Ждет подтверждения',
  PROCESSING: 'Фактория собирает',
  SENT: 'Отправлен',
  COMPLETED: 'Выполнен',
  CANCELLED: 'Отменен чумом',
  DENIED: 'Отклонен факторией',
};

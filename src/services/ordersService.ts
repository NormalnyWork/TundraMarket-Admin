import { initialOrders, ordersStorageKey } from '../data/orders';
import type { Order, OrderStatus } from '../types/orders';

export type OrderStats = {
  total: number;
  created: number;
  processing: number;
  sent: number;
  completed: number;
  cancelled: number;
  denied: number;
};

export type PopularItemStat = {
  name: string;
  quantity: number;
  revenue: number;
};

export type StatusStat = {
  status: OrderStatus;
  orders: number;
};

export type TradingStationStat = {
  name: string;
  orders: number;
  revenue: number;
};

export type OrderAnalytics = {
  totalRevenue: number;
  averageOrderTotal: number;
  averageOrdersPerDay: number;
  busiestDay: string;
  popularItems: PopularItemStat[];
  statusStats: StatusStat[];
  tradingStationStats: TradingStationStat[];
};

function isOrder(value: unknown): value is Order {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const order = value as Partial<Order>;

  return (
    typeof order.id === 'number' &&
    typeof order.createdAt === 'string' &&
    typeof order.status === 'string' &&
    Boolean(order.nomad) &&
    Boolean(order.tradingStation) &&
    Boolean(order.location) &&
    Array.isArray(order.history) &&
    Array.isArray(order.items)
  );
}

export function loadOrders(): Order[] {
  try {
    const savedOrders = localStorage.getItem(ordersStorageKey);
    const parsedOrders = savedOrders ? JSON.parse(savedOrders) : null;

    if (Array.isArray(parsedOrders) && parsedOrders.every(isOrder)) {
      return parsedOrders;
    }

    localStorage.setItem(ordersStorageKey, JSON.stringify(initialOrders));
    return initialOrders;
  } catch {
    return initialOrders;
  }
}

export function saveOrders(orders: Order[]) {
  localStorage.setItem(ordersStorageKey, JSON.stringify(orders));
}

export function getOrderTotal(order: Order) {
  return order.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
}

export function getOrderStats(orders: Order[]): OrderStats {
  return {
    total: orders.length,
    created: orders.filter((order) => order.status === 'CREATED').length,
    processing: orders.filter((order) => order.status === 'PROCESSING').length,
    sent: orders.filter((order) => order.status === 'SENT').length,
    completed: orders.filter((order) => order.status === 'COMPLETED').length,
    cancelled: orders.filter((order) => order.status === 'CANCELLED').length,
    denied: orders.filter((order) => order.status === 'DENIED').length,
  };
}

export function getOrderAnalytics(orders: Order[]): OrderAnalytics {
  const totalRevenue = orders.reduce((sum, order) => sum + getOrderTotal(order), 0);
  const averageOrderTotal = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;
  const ordersByDay = new Map<string, number>();
  const popularItems = new Map<string, PopularItemStat>();
  const statusStats = new Map<OrderStatus, number>();
  const tradingStationStats = new Map<string, TradingStationStat>();

  orders.forEach((order) => {
    const day = order.createdAt.split(' ')[0] || order.createdAt;
    const orderTotal = getOrderTotal(order);
    ordersByDay.set(day, (ordersByDay.get(day) ?? 0) + 1);
    statusStats.set(order.status, (statusStats.get(order.status) ?? 0) + 1);

    const currentStation = tradingStationStats.get(order.tradingStation.name) ?? {
      name: order.tradingStation.name,
      orders: 0,
      revenue: 0,
    };
    tradingStationStats.set(order.tradingStation.name, {
      ...currentStation,
      orders: currentStation.orders + 1,
      revenue: currentStation.revenue + orderTotal,
    });

    order.items.forEach((item) => {
      const currentItem = popularItems.get(item.name) ?? {
        name: item.name,
        quantity: 0,
        revenue: 0,
      };

      popularItems.set(item.name, {
        ...currentItem,
        quantity: currentItem.quantity + item.quantity,
        revenue: currentItem.revenue + item.quantity * item.price,
      });
    });
  });

  const dayCount = Math.max(ordersByDay.size, 1);
  const busiestDayEntry = Array.from(ordersByDay.entries()).sort(([, firstCount], [, secondCount]) => secondCount - firstCount)[0];

  return {
    totalRevenue,
    averageOrderTotal,
    averageOrdersPerDay: Number((orders.length / dayCount).toFixed(1)),
    busiestDay: busiestDayEntry ? `${busiestDayEntry[0]} · ${busiestDayEntry[1]} заказов` : 'Нет данных',
    popularItems: Array.from(popularItems.values())
      .sort((firstItem, secondItem) => secondItem.quantity - firstItem.quantity)
      .slice(0, 5),
    statusStats: Array.from(statusStats.entries()).map(([status, orderCount]) => ({
      status,
      orders: orderCount,
    })),
    tradingStationStats: Array.from(tradingStationStats.values())
      .sort((firstStation, secondStation) => secondStation.orders - firstStation.orders)
      .slice(0, 5),
  };
}

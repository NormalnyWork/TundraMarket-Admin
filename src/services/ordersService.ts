import type { Location, Order, OrderItem, OrderStatus, StatusHistory, TradingStation } from '../types/orders';
import { apiRequest } from './apiClient';

export type OrderStats = {
  total: number;
  created: number;
  processing: number;
  sent: number;
  completed: number;
  cancelled: number;
  denied: number;
};

export type DailyOrderStat = {
  day: string;
  orders: number;
};

export type PopularItemStat = {
  name: string;
  quantity: number;
};

export type CategoryStat = {
  name: string;
  quantity: number;
};

export type StatusStat = {
  status: OrderStatus;
  orders: number;
};

export type TradingStationStat = {
  name: string;
  orders: number;
};

export type OrderAnalytics = {
  averageOrdersPerDay: number;
  busiestDay: string;
  dailyTrend: DailyOrderStat[];
  popularItems: PopularItemStat[];
  categoryStats: CategoryStat[];
  statusStats: StatusStat[];
  tradingStationStats: TradingStationStat[];
};

export type OrdersLoadResult = {
  orders: Order[];
  message: string;
};

type ApiNomad = {
  id?: number;
  phone?: string | null;
};

type ApiTradingStation = {
  id: number;
  name?: string;
  phone?: string | null;
  location?: Partial<Location>;
  latitude?: number;
  longitude?: number;
};

type ApiProduct = {
  id: number;
  name?: string;
  details?: string | null;
  weight?: number;
  volume?: number;
};

type ApiProductCount = {
  id?: number;
  productId?: number;
  product_id?: number;
  product?: ApiProduct;
  name?: string;
  count?: number;
  quantity?: number;
};

type ApiStatusHistory = {
  status?: string;
  time?: number | string;
  createdAt?: string;
  created_at?: string;
};

type ApiOrder = {
  id: number;
  nomadId?: number;
  nomad_id?: number;
  nomad?: ApiNomad;
  from?: ApiNomad;
  tradingStationId?: number;
  trading_station_id?: number;
  tradingStation?: ApiTradingStation;
  trading_station?: ApiTradingStation;
  to?: ApiTradingStation;
  status?: string;
  history?: ApiStatusHistory[];
  statusHistory?: ApiStatusHistory[];
  status_history?: ApiStatusHistory[];
  comment?: string;
  card?: ApiProductCount[];
  cart?: ApiProductCount[];
  products?: ApiProductCount[];
  location?: Partial<Location>;
  latitude?: number;
  longitude?: number;
  createdAt?: string;
  created_at?: string;
};

const fallbackStation: TradingStation = {
  id: 0,
  name: 'Фактория не указана',
  phone: null,
  location: {
    latitude: 0,
    longitude: 0,
  },
};

function extractList<T>(response: unknown, keys: string[]): T[] {
  if (Array.isArray(response)) {
    return response as T[];
  }

  if (!response || typeof response !== 'object') {
    return [];
  }

  const source = response as Record<string, unknown>;

  for (const key of keys) {
    if (Array.isArray(source[key])) {
      return source[key] as T[];
    }
  }

  return [];
}

function normalizeStatus(status: string | undefined): OrderStatus {
  const normalized = (status ?? 'CREATED')
    .replace(/^STATUS_/, '')
    .trim()
    .toUpperCase();

  if (['CREATED', 'PROCESSING', 'SENT', 'COMPLETED', 'CANCELLED', 'DENIED'].includes(normalized)) {
    return normalized as OrderStatus;
  }

  return 'CREATED';
}

function normalizeTime(value: number | string | undefined) {
  if (typeof value === 'number') {
    return new Date(value * 1000).toISOString().replace('T', ' ').slice(0, 16);
  }

  if (typeof value === 'string' && /^\d+$/.test(value)) {
    return new Date(Number(value) * 1000).toISOString().replace('T', ' ').slice(0, 16);
  }

  return value ?? '';
}

function mapStatusHistory(history: ApiStatusHistory[] | undefined): StatusHistory[] {
  return (history ?? []).map((item) => ({
    status: normalizeStatus(item.status),
    time: normalizeTime(item.time ?? item.createdAt ?? item.created_at),
  }));
}

type ApiLocationSource = Partial<Location> & {
  location?: Partial<Location>;
};

function mapLocation(source: ApiLocationSource | undefined): Location {
  return {
    latitude: Number(source?.location?.latitude ?? source?.latitude ?? 0),
    longitude: Number(source?.location?.longitude ?? source?.longitude ?? 0),
  };
}

function getProductCategory(name: string) {
  const normalizedName = name.toLowerCase();

  if (normalizedName.includes('гигиен')) {
    return 'Гигиена';
  }

  if (normalizedName.includes('молоко') || normalizedName.includes('хлеб') || normalizedName.includes('круп')) {
    return 'Продукты';
  }

  return 'Другое';
}

function mapProducts(card: ApiProductCount[] | undefined, catalog: Map<number, ApiProduct>): OrderItem[] {
  return (card ?? []).map((item) => {
    const productId = Number(item.product?.id ?? item.productId ?? item.product_id ?? item.id ?? 0);
    const product = item.product ?? catalog.get(productId);

    return {
      productId,
      name: item.name ?? product?.name ?? `Товар #${productId}`,
      quantity: Number(item.count ?? item.quantity ?? 0),
    };
  });
}

function mapStation(station: ApiTradingStation): TradingStation {
  return {
    id: Number(station.id),
    name: station.name ?? `Фактория #${station.id}`,
    phone: station.phone ?? null,
    location: mapLocation(station),
  };
}

function mapApiOrder(order: ApiOrder, stations: Map<number, TradingStation>, catalog: Map<number, ApiProduct>): Order {
  const nestedStation = order.tradingStation ?? order.trading_station ?? order.to;
  const tradingStationId = Number(nestedStation?.id ?? order.tradingStationId ?? order.trading_station_id ?? 0);
  const nestedNomad = order.nomad ?? order.from;
  const nomadId = Number(nestedNomad?.id ?? order.nomadId ?? order.nomad_id ?? 0);
  const history = mapStatusHistory(order.history ?? order.statusHistory ?? order.status_history);
  const createdAt = normalizeTime(order.createdAt ?? order.created_at ?? history[0]?.time);

  return {
    id: Number(order.id),
    createdAt,
    nomad: {
      id: nomadId,
      phone: nestedNomad?.phone ?? '',
    },
    tradingStation: nestedStation ? mapStation(nestedStation) : stations.get(tradingStationId) ?? {
      ...fallbackStation,
      id: tradingStationId,
      name: tradingStationId > 0 ? `Фактория #${tradingStationId}` : fallbackStation.name,
    },
    status: normalizeStatus(order.status),
    history,
    location: mapLocation(order),
    items: mapProducts(order.card ?? order.cart ?? order.products, catalog),
    comment: order.comment ?? '',
  };
}

async function loadTradingStations(token: string) {
  const response = await apiRequest<unknown>('/admin/trading-stations', { token });
  const stations = extractList<ApiTradingStation>(response, ['result', 'tradingStations', 'trading_stations', 'stations']);

  return new Map(stations.map((station) => [Number(station.id), mapStation(station)]));
}

async function loadCatalog(token: string) {
  const response = await apiRequest<unknown>('/admin/catalog', { token });
  const products = extractList<ApiProduct>(response, ['result', 'products', 'catalog']);

  return new Map(products.map((product) => [Number(product.id), product]));
}

async function loadApiOrders(token: string) {
  const response = await apiRequest<unknown>('/admin/orders', {
    token,
    query: {
      page_size: 500,
    },
  });
  return extractList<ApiOrder>(response, ['result', 'orders']);
}

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

export function getOrderDay(order: Order) {
  return order.createdAt.split(' ')[0] || order.createdAt;
}

export async function loadOrdersFromApi(token: string): Promise<OrdersLoadResult> {
  try {
    const [stations, catalog, apiOrders] = await Promise.all([
      loadTradingStations(token),
      loadCatalog(token),
      loadApiOrders(token),
    ]);
    const orders = apiOrders.map((order) => mapApiOrder(order, stations, catalog)).filter(isOrder);

    if (orders.length === 0) {
      return {
        orders: [],
        message: 'Заказов пока нет.',
      };
    }

    return {
      orders,
      message: '',
    };
  } catch {
    return {
      orders: [],
      message: 'Не удалось загрузить данные. Проверьте подключение к серверу.',
    };
  }
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
  const ordersByDay = new Map<string, number>();
  const popularItems = new Map<string, PopularItemStat>();
  const categoryStats = new Map<string, CategoryStat>();
  const statusStats = new Map<OrderStatus, number>();
  const tradingStationStats = new Map<string, TradingStationStat>();

  orders.forEach((order) => {
    const day = getOrderDay(order);
    ordersByDay.set(day, (ordersByDay.get(day) ?? 0) + 1);
    statusStats.set(order.status, (statusStats.get(order.status) ?? 0) + 1);

    const currentStation = tradingStationStats.get(order.tradingStation.name) ?? {
      name: order.tradingStation.name,
      orders: 0,
    };
    tradingStationStats.set(order.tradingStation.name, {
      ...currentStation,
      orders: currentStation.orders + 1,
    });

    order.items.forEach((item) => {
      const currentItem = popularItems.get(item.name) ?? {
        name: item.name,
        quantity: 0,
      };
      popularItems.set(item.name, {
        ...currentItem,
        quantity: currentItem.quantity + item.quantity,
      });

      const categoryName = getProductCategory(item.name);
      const currentCategory = categoryStats.get(categoryName) ?? {
        name: categoryName,
        quantity: 0,
      };
      categoryStats.set(categoryName, {
        ...currentCategory,
        quantity: currentCategory.quantity + item.quantity,
      });
    });
  });

  const dayCount = Math.max(ordersByDay.size, 1);
  const busiestDayEntry = Array.from(ordersByDay.entries()).sort(([, firstCount], [, secondCount]) => secondCount - firstCount)[0];

  return {
    averageOrdersPerDay: Number((orders.length / dayCount).toFixed(1)),
    busiestDay: busiestDayEntry ? `${busiestDayEntry[0]} · ${busiestDayEntry[1]} заказов` : 'Нет данных',
    dailyTrend: Array.from(ordersByDay.entries())
      .sort(([firstDay], [secondDay]) => firstDay.localeCompare(secondDay))
      .map(([day, orderCount]) => ({
        day,
        orders: orderCount,
      })),
    popularItems: Array.from(popularItems.values())
      .sort((firstItem, secondItem) => secondItem.quantity - firstItem.quantity)
      .slice(0, 5),
    categoryStats: Array.from(categoryStats.values())
      .sort((firstCategory, secondCategory) => secondCategory.quantity - firstCategory.quantity)
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

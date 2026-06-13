import type { Location, OrderStatus } from '../types/orders';

export type TundraAdminApiError =
  | 'INVALID_ID'
  | 'UNKNOWN_STATUS'
  | 'UNKNOWN_CATEGORY'
  | 'ILLEGAL_STATUS_CHANGE';

export type TundraStatusHistory = {
  status: OrderStatus;
  time: number;
};

export type TundraProductCount = {
  id: number;
  count: number;
};

export type TundraTradingStation = {
  id: number;
  name: string;
  phone: string | null;
  location: Location;
};

export type TundraProduct = {
  id: number;
  name: string;
  details: string | null;
  weight: number;
  volume: number;
};

export type TundraApiOrder = {
  id: number;
  nomadId: number;
  tradingStationId: number;
  status: OrderStatus;
  history: TundraStatusHistory[];
  comment: string;
  card: TundraProductCount[];
  location: Location;
};

export type TundraEndpoint = {
  method: 'GET' | 'POST';
  path: string;
  purpose: string;
  request: string[];
  response: string[];
  errors?: TundraAdminApiError[];
};

export const tundraApiEndpoints: TundraEndpoint[] = [
  {
    method: 'POST',
    path: '/admin/auth',
    purpose: 'Авторизация администратора и получение токена для аналитической панели',
    request: ['login: String', 'password: String'],
    response: ['token: String'],
  },
  {
    method: 'GET',
    path: '/admin/orders',
    purpose: 'Список заказов для мониторинга и аналитики',
    request: ['token: String'],
    response: ['orders: Order[] | result: Order[] | Order[]'],
    errors: ['INVALID_ID'],
  },
  {
    method: 'GET',
    path: '/admin/trading-stations',
    purpose: 'Список факторий для аналитики по торговым точкам',
    request: ['token: String'],
    response: ['result: TradingStation[] | TradingStation[]'],
  },
  {
    method: 'GET',
    path: '/admin/catalog',
    purpose: 'Каталог товаров для расчета популярности товаров и категорий',
    request: ['token: String'],
    response: ['result: Product[] | Product[]'],
  },
];

export const tundraApiEntities = [
  'TradingStation',
  'Product',
  'Location',
  'Order',
  'StatusHistory',
  'ProductCount',
];

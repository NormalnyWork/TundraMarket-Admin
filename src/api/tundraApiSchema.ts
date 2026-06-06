import type { Location, OrderStatus } from '../types/orders';

export type TundraOrderCategory = 'PROCESSING' | 'NEW' | 'HISTORY';

export type TundraApiError =
  | 'INVALID_ID'
  | 'DISTANCE_TOO_FAR'
  | 'EMPTY_CART'
  | 'UNKNOWN_STATUS'
  | 'UNKNOWN_CATEGORY';

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
  price: number;
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
  errors?: TundraApiError[];
};

export const tundraApiEndpoints: TundraEndpoint[] = [
  {
    method: 'POST',
    path: '/user/auth',
    purpose: 'Авторизация клиента по телефону и торговой точке',
    request: ['phone: String', 'tradingStationId: Int | Null'],
    response: ['token: String'],
  },
  {
    method: 'GET',
    path: '/trading-stations/list',
    purpose: 'Список доступных факторий/торговых точек',
    request: [],
    response: ['result: TradingStation[]'],
  },
  {
    method: 'GET',
    path: '/user/catalog',
    purpose: 'Каталог товаров для заказа',
    request: [],
    response: ['result: Product[]'],
  },
  {
    method: 'GET',
    path: '/user/current-order',
    purpose: 'Текущий заказ пользователя',
    request: ['token: String'],
    response: ['order: Order | null'],
  },
  {
    method: 'GET',
    path: '/order/check-status',
    purpose: 'Проверка изменений статуса после слабой связи',
    request: ['token: String', 'time: Int unix seconds', 'orderId: Int'],
    response: ['status: StatusHistory[]'],
  },
  {
    method: 'POST',
    path: '/order/create',
    purpose: 'Создание заказа',
    request: ['token: String', 'tradingStationId: Int', 'location: Location', 'products: ProductCount[]', 'comment: String'],
    response: ['orderId: Int'],
    errors: ['INVALID_ID', 'DISTANCE_TOO_FAR', 'EMPTY_CART'],
  },
  {
    method: 'POST',
    path: '/order/change-status',
    purpose: 'Смена статуса заказа оператором/доставкой',
    request: ['token: String', 'orderId: Int', 'newStatus: Status', 'comment: String | Null'],
    response: ['time: Int unix seconds'],
    errors: ['INVALID_ID', 'UNKNOWN_STATUS'],
  },
  {
    method: 'GET',
    path: '/order/list',
    purpose: 'Список заказов для панели оператора',
    request: ['token: String', 'anchor: Int | Null', 'pageSize: Int', 'orderCategory: OrderCategory'],
    response: ['orders: Order[]'],
    errors: ['INVALID_ID', 'UNKNOWN_CATEGORY'],
  },
  {
    method: 'GET',
    path: '/order/updates',
    purpose: 'Получение обновлений после последней синхронизации',
    request: ['token: String', 'time: Int unix seconds'],
    response: ['orders: Order[]'],
  },
];

export const tundraApiEntities = [
  'TradingStation',
  'Product',
  'Location',
  'Order',
  'StatusHistory',
  'ProductCount',
  'OrderCategory',
];

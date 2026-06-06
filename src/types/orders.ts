export type OrderStatus =
  | 'CREATED'
  | 'PROCESSING'
  | 'SENT'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DENIED';

export type Location = {
  longitude: number;
  latitude: number;
};

export type Nomad = {
  id: number;
  phone: string;
};

export type TradingStation = {
  id: number;
  name: string;
  phone: string | null;
  location: Location;
};

export type StatusHistory = {
  status: OrderStatus;
  time: string;
};

export type OrderItem = {
  productId: number;
  name: string;
  quantity: number;
  price: number;
};

export type Order = {
  id: number;
  createdAt: string;
  nomad: Nomad;
  tradingStation: TradingStation;
  status: OrderStatus;
  history: StatusHistory[];
  location: Location;
  items: OrderItem[];
  comment: string;
};

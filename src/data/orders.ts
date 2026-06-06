import type { Order, TradingStation } from '../types/orders';

export const ordersStorageKey = 'north-orders-admin-orders-v3';

const sabettaStation: TradingStation = {
  id: 1,
  name: 'Фактория Сабетта',
  phone: '+7 900 700-10-01',
  location: {
    longitude: 72.052,
    latitude: 71.273,
  },
};

const yamburgStation: TradingStation = {
  id: 2,
  name: 'Фактория Ямбург',
  phone: '+7 900 700-10-02',
  location: {
    longitude: 75.101,
    latitude: 67.889,
  },
};

const tazStation: TradingStation = {
  id: 3,
  name: 'Фактория Тазовская',
  phone: '+7 900 700-10-03',
  location: {
    longitude: 78.706,
    latitude: 67.467,
  },
};

export const initialOrders: Order[] = [
  {
    id: 1001,
    createdAt: '2026-06-01 09:20',
    nomad: {
      id: 12,
      phone: '+7 900 111-22-33',
    },
    tradingStation: sabettaStation,
    status: 'CREATED',
    history: [{ status: 'CREATED', time: '2026-06-01 09:20' }],
    location: {
      longitude: 72.218,
      latitude: 71.311,
    },
    comment: 'Ожидает подтверждения факторией.',
    items: [
      { productId: 1, name: 'Хлеб', quantity: 2, price: 49 },
      { productId: 2, name: 'Молоко', quantity: 3, price: 109 },
      { productId: 3, name: 'Крупы', quantity: 4, price: 189 },
    ],
  },
  {
    id: 1002,
    createdAt: '2026-06-01 10:05',
    nomad: {
      id: 18,
      phone: '+7 900 222-44-55',
    },
    tradingStation: yamburgStation,
    status: 'PROCESSING',
    history: [
      { status: 'CREATED', time: '2026-06-01 10:05' },
      { status: 'PROCESSING', time: '2026-06-01 10:22' },
    ],
    location: {
      longitude: 75.245,
      latitude: 67.951,
    },
    comment: 'Фактория собирает заказ.',
    items: [
      { productId: 2, name: 'Молоко', quantity: 2, price: 109 },
      { productId: 4, name: 'Средства гигиены', quantity: 1, price: 299 },
      { productId: 3, name: 'Крупы', quantity: 2, price: 189 },
    ],
  },
  {
    id: 1003,
    createdAt: '2026-06-02 11:40',
    nomad: {
      id: 21,
      phone: '+7 900 333-66-77',
    },
    tradingStation: sabettaStation,
    status: 'SENT',
    history: [
      { status: 'CREATED', time: '2026-06-02 11:40' },
      { status: 'PROCESSING', time: '2026-06-02 12:10' },
      { status: 'SENT', time: '2026-06-02 13:05' },
    ],
    location: {
      longitude: 72.418,
      latitude: 71.157,
    },
    comment: 'Заказ отправлен на дроне.',
    items: [
      { productId: 3, name: 'Крупы', quantity: 5, price: 189 },
      { productId: 1, name: 'Хлеб', quantity: 3, price: 49 },
      { productId: 4, name: 'Средства гигиены', quantity: 2, price: 299 },
    ],
  },
  {
    id: 1004,
    createdAt: '2026-06-03 12:15',
    nomad: {
      id: 25,
      phone: '+7 900 444-88-99',
    },
    tradingStation: tazStation,
    status: 'COMPLETED',
    history: [
      { status: 'CREATED', time: '2026-06-03 12:15' },
      { status: 'PROCESSING', time: '2026-06-03 12:40' },
      { status: 'SENT', time: '2026-06-03 13:35' },
      { status: 'COMPLETED', time: '2026-06-03 14:20' },
    ],
    location: {
      longitude: 78.831,
      latitude: 67.612,
    },
    comment: 'Заказ выполнен.',
    items: [
      { productId: 1, name: 'Хлеб', quantity: 4, price: 49 },
      { productId: 2, name: 'Молоко', quantity: 2, price: 109 },
      { productId: 4, name: 'Средства гигиены', quantity: 1, price: 299 },
    ],
  },
  {
    id: 1005,
    createdAt: '2026-06-04 15:00',
    nomad: {
      id: 27,
      phone: '+7 900 555-10-20',
    },
    tradingStation: yamburgStation,
    status: 'CANCELLED',
    history: [
      { status: 'CREATED', time: '2026-06-04 15:00' },
      { status: 'CANCELLED', time: '2026-06-04 15:18' },
    ],
    location: {
      longitude: 75.032,
      latitude: 67.742,
    },
    comment: 'Чум отменил заказ.',
    items: [
      { productId: 3, name: 'Крупы', quantity: 1, price: 189 },
      { productId: 2, name: 'Молоко', quantity: 1, price: 109 },
    ],
  },
  {
    id: 1006,
    createdAt: '2026-06-05 09:35',
    nomad: {
      id: 31,
      phone: '+7 900 777-33-11',
    },
    tradingStation: tazStation,
    status: 'DENIED',
    history: [
      { status: 'CREATED', time: '2026-06-05 09:35' },
      { status: 'DENIED', time: '2026-06-05 09:58' },
    ],
    location: {
      longitude: 79.302,
      latitude: 67.895,
    },
    comment: 'Фактория отклонила заказ.',
    items: [
      { productId: 4, name: 'Средства гигиены', quantity: 3, price: 299 },
      { productId: 1, name: 'Хлеб', quantity: 2, price: 49 },
    ],
  },
];

export const dailyStats = [
  { day: 'Пн', orders: 18 },
  { day: 'Вт', orders: 22 },
  { day: 'Ср', orders: 19 },
  { day: 'Чт', orders: 27 },
  { day: 'Пт', orders: 31 },
  { day: 'Сб', orders: 24 },
  { day: 'Вс', orders: 16 },
];

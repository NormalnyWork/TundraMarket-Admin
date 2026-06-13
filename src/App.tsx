import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  LogOut,
  MapPin,
  Package,
  RotateCcw,
  Search,
  ShoppingBasket,
  Truck,
} from 'lucide-react';
import { StatCard } from './components/StatCard';
import { statusLabels } from './constants/orderLabels';
import { LoginScreen } from './features/auth/LoginScreen';
import { StatusBadge } from './features/orders/OrderBadges';
import {
  clearCurrentUser,
  loadCurrentUser,
  loginAdmin,
  saveCurrentUser,
} from './services/authService';
import {
  getOrderAnalytics,
  getOrderDay,
  getOrderStats,
  loadOrdersFromApi,
} from './services/ordersService';
import type { Order, OrderStatus } from './types/orders';

type QuickFilter = 'ALL' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'DENIED';

const quickFilterLabels: Record<QuickFilter, string> = {
  ALL: 'Все',
  ACTIVE: 'В работе',
  COMPLETED: 'Выполнены',
  CANCELLED: 'Отменены',
  DENIED: 'Отклонены',
};

function getOrderDate(order: Order) {
  return new Date(`${getOrderDay(order)}T00:00:00`);
}

function formatCoordinates(order: Order) {
  return `${order.location.latitude.toFixed(3)}, ${order.location.longitude.toFixed(3)}`;
}

function isOrderInDateRange(order: Order, dateFrom: string, dateTo: string) {
  const orderDate = getOrderDate(order);

  if (dateFrom && orderDate < new Date(`${dateFrom}T00:00:00`)) {
    return false;
  }

  if (dateTo && orderDate > new Date(`${dateTo}T23:59:59`)) {
    return false;
  }

  return true;
}

function App() {
  const [currentUser, setCurrentUser] = useState(loadCurrentUser);
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('ALL');
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    let isMounted = true;

    loadOrdersFromApi(currentUser.token).then((result) => {
      if (!isMounted) {
        return;
      }

      setOrders(result.orders);
      setNotice(result.message);
    });

    return () => {
      isMounted = false;
    };
  }, [currentUser]);

  const intervalOrders = useMemo(() => {
    return orders.filter((order) => isOrderInDateRange(order, dateFrom, dateTo));
  }, [dateFrom, dateTo, orders]);

  const filteredOrders = useMemo(() => {
    return intervalOrders.filter((order) => {
      const query = search.toLowerCase().trim();
      const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
      const matchesQuickFilter =
        quickFilter === 'ALL' ||
        (quickFilter === 'ACTIVE' && ['CREATED', 'PROCESSING', 'SENT'].includes(order.status)) ||
        (quickFilter === 'COMPLETED' && order.status === 'COMPLETED') ||
        (quickFilter === 'CANCELLED' && order.status === 'CANCELLED') ||
        (quickFilter === 'DENIED' && order.status === 'DENIED');
      const matchesSearch =
        !query ||
        order.nomad.phone.toLowerCase().includes(query) ||
        order.tradingStation.name.toLowerCase().includes(query) ||
        order.comment.toLowerCase().includes(query) ||
        String(order.id).includes(query);

      return matchesStatus && matchesQuickFilter && matchesSearch;
    });
  }, [intervalOrders, quickFilter, search, statusFilter]);

  const stats = useMemo(() => getOrderStats(intervalOrders), [intervalOrders]);
  const analytics = useMemo(() => getOrderAnalytics(intervalOrders), [intervalOrders]);
  const activeOrdersCount = stats.created + stats.processing + stats.sent;
  const hasFilters = statusFilter !== 'ALL' || quickFilter !== 'ALL' || search.trim() !== '' || dateFrom !== '' || dateTo !== '';

  function resetFilters() {
    setStatusFilter('ALL');
    setQuickFilter('ALL');
    setSearch('');
    setDateFrom('');
    setDateTo('');
  }

  function resetDateFilter() {
    setDateFrom('');
    setDateTo('');
  }

  async function signIn(credentials: Parameters<typeof loginAdmin>[0]) {
    try {
      const user = await loginAdmin(credentials);
      saveCurrentUser(user);
      setCurrentUser(user);
      setNotice('');
      return true;
    } catch {
      return false;
    }
  }

  function signOut() {
    clearCurrentUser();
    setCurrentUser(null);
    setOrders([]);
    setNotice('');
  }

  if (!currentUser) {
    return <LoginScreen onSubmit={signIn} />;
  }

  return (
    <div className="app-shell min-h-screen">
      <aside className="brand-sidebar fixed left-0 top-0 hidden h-full w-72 flex-col overflow-y-auto border-r p-6 text-white lg:flex">
        <div className="mb-10 flex shrink-0 items-center gap-3">
          <div className="brand-mark" aria-hidden="true">
            <span>ТМ</span>
          </div>
          <div>
            <p className="text-sm text-slate-300">Система аналитики</p>
            <h1 className="text-lg font-black leading-tight">Тундра-Маркет</h1>
          </div>
        </div>

        <div className="mb-6 rounded-lg bg-white/10 p-4 ring-1 ring-white/10">
          <p className="text-xs text-slate-300">Режим панели</p>
          <p className="mt-1 text-sm font-semibold text-[#F5F3E6]">Мониторинг заказов</p>
        </div>

        <div className="space-y-3 text-sm">
          <div className="rounded-lg bg-white/10 px-4 py-3 ring-1 ring-white/10">
            <p className="text-xs text-slate-300">Заказов в работе</p>
            <p className="mt-1 text-lg font-bold">{activeOrdersCount}</p>
          </div>
          <div className="rounded-lg bg-white/10 px-4 py-3 ring-1 ring-white/10">
            <p className="text-xs text-slate-300">Фактории</p>
            <p className="mt-1 text-lg font-bold">{analytics.tradingStationStats.length}</p>
          </div>
          <div className="rounded-lg bg-white/10 px-4 py-3 ring-1 ring-white/10">
            <p className="text-xs text-slate-300">Отменены или отклонены</p>
            <p className="mt-1 text-lg font-bold">{stats.cancelled + stats.denied}</p>
          </div>
        </div>

        <div className="mt-auto rounded-lg bg-white/10 p-4 ring-1 ring-white/10">
          <div className="mb-2 flex items-center gap-2 text-[#F5F3E6]">
            <MapPin size={18} />
            <span className="text-sm font-semibold">Мониторинг заказов</span>
          </div>
        </div>
      </aside>

      <main className="lg:ml-72">
        <header className="brand-header sticky top-0 z-20 border-b px-5 py-4 backdrop-blur lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-slate-500">Админ-панель</p>
              <h2 className="text-2xl font-bold text-slate-950">Тундра-Маркет</h2>
              <p className="mt-1 text-xs font-semibold text-[#BF1238]">
                Мониторинг заказов, статусов, товаров и факторий
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={signOut}
                className="brand-secondary-button flex h-11 items-center gap-2 rounded-lg px-4 text-sm font-semibold"
              >
                <LogOut size={16} />
                Выйти
              </button>
            </div>
          </div>
        </header>

        {notice && (
          <div className="mx-5 mt-5 rounded-lg border border-[#CFE0DC] bg-[#E5EBE4] px-5 py-4 text-sm font-semibold text-[#1d3b39] lg:mx-8">
            {notice}
          </div>
        )}

        <section id="dashboard" className="space-y-6 p-5 lg:p-8">
          <div className="brand-card rounded-lg p-5 shadow-sm">
            <div className="mb-4 flex flex-col gap-4 2xl:flex-row 2xl:items-center 2xl:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#BF1238]">Интервал заказов</p>
                <h3 className="text-lg font-bold">Список заказов за выбранный период</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Найдено заказов: <span className="font-bold text-slate-950">{intervalOrders.length}</span>
                </p>
              </div>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Дата с
                    <input
                      type="date"
                      value={dateFrom}
                      onChange={(event) => setDateFrom(event.target.value)}
                      className="mt-1 h-11 w-full rounded-lg border border-[#CFE0DC] bg-white px-3 text-sm text-slate-800 outline-none focus:border-slate-950 sm:w-44"
                    />
                  </label>
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Дата по
                    <input
                      type="date"
                      value={dateTo}
                      onChange={(event) => setDateTo(event.target.value)}
                      className="mt-1 h-11 w-full rounded-lg border border-[#CFE0DC] bg-white px-3 text-sm text-slate-800 outline-none focus:border-slate-950 sm:w-44"
                    />
                  </label>
                </div>
                <button
                  type="button"
                  onClick={resetDateFilter}
                  disabled={!dateFrom && !dateTo}
                  className="brand-secondary-button flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <RotateCcw size={16} />
                  Сбросить период
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
            <StatCard title="Всего заказов" value={stats.total} icon={<Package />} />
            <StatCard title="Ждут факторию" value={stats.created} icon={<Clock3 />} />
            <StatCard title="Собираются" value={stats.processing} icon={<ShoppingBasket />} />
            <StatCard title="Отправлены" value={stats.sent} icon={<Truck />} />
            <StatCard title="Выполнены" value={stats.completed} icon={<CheckCircle2 />} />
            <StatCard title="Отменены/отклонены" value={stats.cancelled + stats.denied} icon={<AlertTriangle />} warning />
          </div>

          <div className="grid gap-6 2xl:grid-cols-[1.4fr_0.8fr]">
            <div className="brand-card rounded-lg p-5 shadow-sm">
              <div className="mb-5">
                <h3 className="text-lg font-bold">Динамика заказов по дням</h3>
                <p className="text-sm text-slate-500">Количество заказов в выбранном интервале</p>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <BarChart data={analytics.dailyTrend}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" />
                    <YAxis allowDecimals={false} />
                    <Tooltip formatter={(value) => [`${value}`, 'Заказы']} labelFormatter={(label) => `${label}`} />
                    <Bar dataKey="orders" fill="#BF1238" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="brand-card rounded-lg p-5 shadow-sm">
              <h3 className="mb-2 text-lg font-bold">Распределение по статусам</h3>
              <p className="mb-5 text-sm leading-6 text-slate-500">
                Статусы соответствуют модели заказов: Created, Processing, Sent, Completed, Cancelled, Denied.
              </p>
              <div className="space-y-3">
                {analytics.statusStats.map((statusStat) => {
                  const percent = stats.total > 0 ? Math.round((statusStat.orders / stats.total) * 100) : 0;

                  return (
                    <div key={statusStat.status} className="rounded-lg border border-[#D7DDDA] bg-white/55 p-3">
                      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                        <span className="font-semibold">{statusLabels[statusStat.status]}</span>
                        <span className="text-slate-500">{statusStat.orders} · {percent}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-[#D7DDDA]">
                        <div className="h-full rounded-full bg-[#BF1238]" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="brand-card rounded-lg p-5 shadow-sm">
            <div className="mb-5">
              <p className="text-sm font-semibold text-[#BF1238]">Аналитика заказов</p>
              <h3 className="text-lg font-bold">Частота, товары, категории и фактории</h3>
            </div>

            <div className="mb-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-[#D7DDDA] bg-white/55 p-4">
                <div className="mb-3 inline-flex rounded-lg bg-[#CFE0DC] p-2 text-[#1d3b39]">
                  <BarChart3 size={20} />
                </div>
                <p className="text-sm text-slate-500">Заказов за период</p>
                <p className="mt-1 text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="rounded-lg border border-[#D7DDDA] bg-white/55 p-4">
                <div className="mb-3 inline-flex rounded-lg bg-[#CFE0DC] p-2 text-[#1d3b39]">
                  <Activity size={20} />
                </div>
                <p className="text-sm text-slate-500">Средняя частота</p>
                <p className="mt-1 text-2xl font-bold">{analytics.averageOrdersPerDay} / день</p>
                <p className="mt-1 text-xs text-slate-500">{analytics.busiestDay}</p>
              </div>
              <div className="rounded-lg border border-[#D7DDDA] bg-white/55 p-4">
                <div className="mb-3 inline-flex rounded-lg bg-[#CFE0DC] p-2 text-[#1d3b39]">
                  <CalendarDays size={20} />
                </div>
                <p className="text-sm text-slate-500">Дней с заказами</p>
                <p className="mt-1 text-2xl font-bold">{analytics.dailyTrend.length}</p>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-3">
              <div className="rounded-lg border border-[#D7DDDA] bg-white/45 p-4">
                <h4 className="mb-4 font-bold">Популярные товары</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <BarChart data={analytics.popularItems} layout="vertical" margin={{ left: 12, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" allowDecimals={false} />
                      <YAxis dataKey="name" type="category" width={130} />
                      <Tooltip formatter={(value) => [`${value}`, 'Количество']} />
                      <Bar dataKey="quantity" fill="#1d3b39" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-lg border border-[#D7DDDA] bg-white/45 p-4">
                <h4 className="mb-4 font-bold">Категории товаров</h4>
                <div className="space-y-3">
                  {analytics.categoryStats.map((category) => (
                    <div key={category.name} className="flex items-center justify-between rounded-lg bg-white/65 px-4 py-3 text-sm">
                      <span className="font-semibold">{category.name}</span>
                      <span className="text-slate-500">{category.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-[#D7DDDA] bg-white/45 p-4">
                <h4 className="mb-4 font-bold">Заказы по факториям</h4>
                <div className="space-y-3">
                  {analytics.tradingStationStats.map((stationStat) => {
                    const percent = stats.total > 0 ? Math.round((stationStat.orders / stats.total) * 100) : 0;

                    return (
                      <div key={stationStat.name} className="rounded-lg bg-white/65 p-3">
                        <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                          <span className="font-semibold">{stationStat.name}</span>
                          <span className="text-slate-500">{stationStat.orders} · {percent}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-[#D7DDDA]">
                          <div className="h-full rounded-full bg-[#BF1238]" style={{ width: `${percent}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="orders" className="p-5 pt-0 lg:p-8 lg:pt-0">
          <div className="brand-card rounded-lg p-5 shadow-sm">
            <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h3 className="text-xl font-bold">Журнал заказов</h3>
                <p className="text-sm text-slate-500">Заказы за выбранный интервал времени</p>
              </div>

              <div className="flex flex-col gap-3 md:flex-row">
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-4 text-sm outline-none focus:border-slate-950 md:w-72"
                    placeholder="Поиск по заказу, чуму, фактории"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value as OrderStatus | 'ALL')}
                  className="rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-950"
                >
                  <option value="ALL">Все статусы</option>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-5 flex flex-wrap gap-2">
              {(Object.keys(quickFilterLabels) as QuickFilter[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setQuickFilter(value)}
                  className={`rounded-lg border px-3 py-2 text-xs font-semibold ${
                    quickFilter === value
                      ? 'border-[#BF1238] bg-[#BF1238] text-white'
                      : 'border-[#CFE0DC] bg-white/60 text-[#1d3b39]'
                  }`}
                >
                  {quickFilterLabels[value]}
                </button>
              ))}
            </div>

            <div className="hidden overflow-hidden md:block">
              <table className="w-full table-fixed border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                    <th className="w-[10%] py-4 pr-3">N</th>
                    <th className="w-[18%] py-4 pr-3">Чум</th>
                    <th className="w-[22%] py-4 pr-3">Фактория</th>
                    <th className="w-[16%] py-4 pr-3">Статус</th>
                    <th className="hidden w-[18%] py-4 pr-3 2xl:table-cell">Локация</th>
                    <th className="w-[26%] py-4 pr-0">Товары</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-4 pr-3 align-top">
                        <div className="font-semibold">#{order.id}</div>
                        <div className="mt-1 text-[11px] leading-4 text-slate-500">{order.createdAt}</div>
                      </td>
                      <td className="py-4 pr-3 align-top">
                        <div className="truncate font-semibold">#{order.nomad.id}</div>
                        <div className="truncate text-xs text-slate-500">{order.nomad.phone || '+7 *** *** ** **'}</div>
                      </td>
                      <td className="py-4 pr-3 align-top">
                        <div className="truncate font-semibold">{order.tradingStation.name}</div>
                      </td>
                      <td className="py-4 pr-3 align-top">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="hidden py-4 pr-3 align-top 2xl:table-cell">
                        <div className="truncate">{formatCoordinates(order)}</div>
                        <div className="mt-1 truncate text-xs text-slate-500">{order.comment}</div>
                      </td>
                      <td className="py-4 pr-0 align-top">
                        <div className="line-clamp-2 text-xs leading-5 text-slate-600">
                          {order.items.map((item) => `${item.name} x ${item.quantity}`).join(', ')}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 md:hidden">
              {filteredOrders.map((order) => (
                <div key={order.id} className="rounded-lg border border-[#D7DDDA] bg-white/55 p-4">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold">#{order.id} · чум #{order.nomad.id}</p>
                      <p className="mt-1 text-xs text-slate-500">{order.tradingStation.name}</p>
                      <p className="mt-1 text-xs text-slate-500">{formatCoordinates(order)}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="mt-3 text-xs leading-5 text-slate-600">{order.items.map((item) => `${item.name} x ${item.quantity}`).join(', ')}</p>
                </div>
              ))}
            </div>

            {filteredOrders.length === 0 && (
              <div className="rounded-lg border border-dashed border-[#CFE0DC] bg-white/45 p-8 text-center">
                <p className="font-bold">Заказы за выбранный период не найдены</p>
                <p className="mt-2 text-sm text-slate-500">Измените интервал, поиск или фильтры.</p>
                {hasFilters && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="brand-secondary-button mt-4 rounded-lg px-4 py-3 text-sm font-semibold"
                  >
                    Сбросить фильтры
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;

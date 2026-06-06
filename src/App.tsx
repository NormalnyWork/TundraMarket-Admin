import { useMemo, useState } from 'react';
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
  CalendarDays,
  CheckCircle2,
  Clock3,
  LogOut,
  MapPin,
  Package,
  Search,
  ShoppingBasket,
  TrendingUp,
  Truck,
  X,
} from 'lucide-react';
import { StatCard } from './components/StatCard';
import { statusLabels } from './constants/orderLabels';
import { dailyStats } from './data/orders';
import { LoginScreen } from './features/auth/LoginScreen';
import { StatusBadge } from './features/orders/OrderBadges';
import {
  clearCurrentUser,
  loadCurrentUser,
  loginWithDemoUser,
  saveCurrentUser,
} from './services/authService';
import {
  getOrderAnalytics,
  getOrderStats,
  getOrderTotal,
  loadOrders,
} from './services/ordersService';
import type { AuthUser, LoginCredentials } from './types/auth';
import type { Order, OrderStatus } from './types/orders';

type QuickFilter = 'ALL' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'DENIED';
type AnalyticsPeriod = 'WEEK' | 'MONTH' | 'ALL';

const analyticsPeriodLabels: Record<AnalyticsPeriod, string> = {
  WEEK: 'Неделя',
  MONTH: 'Месяц',
  ALL: 'Все',
};

const quickFilterLabels: Record<QuickFilter, string> = {
  ALL: 'Все',
  ACTIVE: 'В работе',
  COMPLETED: 'Выполнены',
  CANCELLED: 'Отменены',
  DENIED: 'Отклонены',
};

function getOrderDate(order: Order) {
  const datePart = order.createdAt.split(' ')[0] || order.createdAt;
  const normalizedDate = datePart.includes('.') ? datePart.split('.').reverse().join('-') : datePart;

  return new Date(normalizedDate);
}

function getAnalyticsPeriodStart(period: AnalyticsPeriod) {
  if (period === 'ALL') {
    return null;
  }

  const startDate = new Date('2026-06-06T00:00:00');
  startDate.setHours(0, 0, 0, 0);
  startDate.setDate(startDate.getDate() - (period === 'WEEK' ? 6 : 29));

  return startDate;
}

function formatCoordinates(order: Order) {
  return `${order.location.latitude.toFixed(3)}, ${order.location.longitude.toFixed(3)}`;
}

function App() {
  const [orders] = useState<Order[]>(loadOrders);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('ALL');
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(loadCurrentUser);
  const [analyticsPeriod, setAnalyticsPeriod] = useState<AnalyticsPeriod>('WEEK');

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
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
  }, [orders, quickFilter, search, statusFilter]);

  const analyticsOrders = useMemo(() => {
    const periodStart = getAnalyticsPeriodStart(analyticsPeriod);

    if (!periodStart) {
      return orders;
    }

    return orders.filter((order) => getOrderDate(order) >= periodStart);
  }, [analyticsPeriod, orders]);

  const stats = useMemo(() => getOrderStats(analyticsOrders), [analyticsOrders]);
  const analytics = useMemo(() => getOrderAnalytics(analyticsOrders), [analyticsOrders]);
  const activeOrdersCount = stats.created + stats.processing + stats.sent;
  const hasFilters = statusFilter !== 'ALL' || quickFilter !== 'ALL' || search.trim() !== '';

  function resetFilters() {
    setStatusFilter('ALL');
    setQuickFilter('ALL');
    setSearch('');
  }

  function signIn(credentials: LoginCredentials) {
    const user = loginWithDemoUser(credentials);

    if (!user) {
      return false;
    }

    saveCurrentUser(user);
    setCurrentUser(user);
    setNotice(`Выполнен вход: ${user.name}`);
    return true;
  }

  function signOut() {
    clearCurrentUser();
    setCurrentUser(null);
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
            <span>СД</span>
          </div>
          <div>
            <p className="text-sm text-slate-300">Система аналитики</p>
            <h1 className="text-lg font-black leading-tight">Ямал. Северная доставка</h1>
          </div>
        </div>

        <div className="mb-6 rounded-lg bg-white/10 p-4 ring-1 ring-white/10">
          <p className="text-xs text-slate-300">Выполнен вход</p>
          <p className="mt-1 text-sm font-semibold text-[#F5F3E6]">{currentUser.name}</p>
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
            <span className="text-sm font-semibold">Мониторинг заказов и факторий</span>
          </div>
        </div>
      </aside>

      <main className="lg:ml-72">
        <header className="brand-header sticky top-0 z-20 border-b px-5 py-4 backdrop-blur lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm text-slate-500">Админ-панель</p>
              <h2 className="text-2xl font-bold text-slate-950">Статистика и мониторинг заказов</h2>
              <p className="mt-1 text-xs font-semibold text-[#BF1238]">
                Объем заказов, частота, популярные товары, статусы и фактории
              </p>
            </div>
            <button
              type="button"
              onClick={signOut}
              className="brand-secondary-button flex w-fit items-center gap-2 rounded-lg px-4 py-3 text-sm font-semibold"
            >
              <LogOut size={18} />
              Выйти
            </button>
          </div>
        </header>

        {notice && (
          <div className="mx-5 mt-5 flex items-start justify-between gap-4 rounded-lg border border-[#CFE0DC] bg-[#E5EBE4] px-5 py-4 text-sm font-semibold text-[#1d3b39] lg:mx-8">
            <span>{notice}</span>
            <button type="button" onClick={() => setNotice('')} aria-label="Скрыть уведомление">
              <X size={16} />
            </button>
          </div>
        )}

        <section id="dashboard" className="space-y-6 p-5 lg:p-8">
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
                <h3 className="text-lg font-bold">Динамика заказов за неделю</h3>
                <p className="text-sm text-slate-500">Частота поступления заказов по дням</p>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <BarChart data={dailyStats}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value}`, 'Заказы']} labelFormatter={(label) => `${label}`} />
                    <Bar dataKey="orders" fill="#BF1238" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="brand-card rounded-lg p-5 shadow-sm">
              <h3 className="mb-2 text-lg font-bold">Распределение по статусам</h3>
              <p className="mb-5 text-sm leading-6 text-slate-500">
                Статусы соответствуют enum из спецификации API: Created, Processing, Sent, Completed, Cancelled, Denied.
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
            <div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#BF1238]">Аналитика заказов</p>
                <h3 className="text-lg font-bold">Объем, частота и популярные товары</h3>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <CalendarDays size={16} />
                  <span>Период</span>
                </div>
                <div className="flex rounded-lg border border-[#CFE0DC] bg-white/60 p-1">
                  {(Object.keys(analyticsPeriodLabels) as AnalyticsPeriod[]).map((period) => (
                    <button
                      key={period}
                      type="button"
                      onClick={() => setAnalyticsPeriod(period)}
                      className={`rounded-md px-3 py-2 text-xs font-semibold ${
                        analyticsPeriod === period ? 'bg-[#BF1238] text-white' : 'text-[#1d3b39] hover:bg-[#E5EBE4]'
                      }`}
                    >
                      {analyticsPeriodLabels[period]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mb-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-[#D7DDDA] bg-white/55 p-4">
                <div className="mb-3 inline-flex rounded-lg bg-[#CFE0DC] p-2 text-[#1d3b39]">
                  <TrendingUp size={20} />
                </div>
                <p className="text-sm text-slate-500">Выручка по товарам</p>
                <p className="mt-1 text-2xl font-bold">{analytics.totalRevenue.toLocaleString('ru-RU')}&nbsp;₽</p>
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
                  <ShoppingBasket size={20} />
                </div>
                <p className="text-sm text-slate-500">Средний чек</p>
                <p className="mt-1 text-2xl font-bold">{analytics.averageOrderTotal.toLocaleString('ru-RU')}&nbsp;₽</p>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <div className="rounded-lg border border-[#D7DDDA] bg-white/45 p-4">
                <h4 className="mb-4 font-bold">Популярные товары</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <BarChart data={analytics.popularItems} layout="vertical" margin={{ left: 12, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={130} />
                      <Tooltip formatter={(value) => [`${value}`, 'Количество']} />
                      <Bar dataKey="quantity" fill="#1d3b39" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
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
                        <p className="mt-2 text-xs text-slate-500">{stationStat.revenue.toLocaleString('ru-RU')}&nbsp;₽</p>
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
                <p className="text-sm text-slate-500">Чум, фактория, статус, координаты и состав заказа</p>
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
                    <th className="w-[20%] py-4 pr-3">Фактория</th>
                    <th className="w-[16%] py-4 pr-3">Статус</th>
                    <th className="hidden w-[17%] py-4 pr-3 2xl:table-cell">Локация</th>
                    <th className="w-[12%] py-4 pr-3 text-right">Сумма</th>
                    <th className="w-[17%] py-4 pr-0">Товары</th>
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
                        <div className="truncate text-xs text-slate-500">{order.nomad.phone}</div>
                      </td>
                      <td className="py-4 pr-3 align-top">
                        <div className="truncate font-semibold">{order.tradingStation.name}</div>
                        <div className="mt-1 truncate text-xs text-slate-500">{order.tradingStation.phone ?? 'Телефон не указан'}</div>
                      </td>
                      <td className="py-4 pr-3 align-top">
                        <StatusBadge status={order.status} />
                      </td>
                      <td className="hidden py-4 pr-3 align-top 2xl:table-cell">
                        <div className="truncate">{formatCoordinates(order)}</div>
                        <div className="mt-1 truncate text-xs text-slate-500">{order.comment}</div>
                      </td>
                      <td className="whitespace-nowrap py-4 pr-3 text-right align-top font-semibold">{getOrderTotal(order).toLocaleString('ru-RU')}&nbsp;₽</td>
                      <td className="py-4 pr-0 align-top">
                        <div className="line-clamp-2 text-xs leading-5 text-slate-600">
                          {order.items.map((item) => `${item.name} × ${item.quantity}`).join(', ')}
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
                    <p className="whitespace-nowrap text-sm font-bold">{getOrderTotal(order).toLocaleString('ru-RU')}&nbsp;₽</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="mt-3 text-xs leading-5 text-slate-600">{order.items.map((item) => `${item.name} × ${item.quantity}`).join(', ')}</p>
                </div>
              ))}
            </div>

            {filteredOrders.length === 0 && (
              <div className="rounded-lg border border-dashed border-[#CFE0DC] bg-white/45 p-8 text-center">
                <p className="font-bold">Заказы не найдены</p>
                <p className="mt-2 text-sm text-slate-500">Измените поиск или сбросьте фильтры.</p>
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

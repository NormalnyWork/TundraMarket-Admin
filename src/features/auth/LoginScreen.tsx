import { useState } from 'react';
import { LockKeyhole } from 'lucide-react';
import type { LoginCredentials } from '../../types/auth';

type LoginScreenProps = {
  onSubmit: (credentials: LoginCredentials) => boolean;
};

export function LoginScreen({ onSubmit }: LoginScreenProps) {
  const [login, setLogin] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const isLoggedIn = onSubmit({ login, password });

    if (!isLoggedIn) {
      setError('Логин или пароль не подходят');
    }
  }

  return (
    <main className="app-shell grid min-h-screen place-items-center p-5">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-lg border border-[#CFE0DC] bg-[#F5F3E6] shadow-xl lg:grid-cols-[0.9fr_1.1fr]">
        <div className="brand-sync-card flex min-h-[460px] flex-col justify-between p-8 text-white">
          <div>
            <div className="brand-mark mb-6" aria-hidden="true">
              <span>СД</span>
            </div>
            <p className="text-sm text-slate-300">Ямал. Северная доставка</p>
            <h1 className="mt-2 text-3xl font-black leading-tight">Вход в панель заказов</h1>
          </div>

          <div className="rounded-lg bg-white/10 p-4 ring-1 ring-white/10">
            <p className="text-sm font-semibold text-[#F5F3E6]">Доступ администратора</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-10">
          <div className="mb-8">
            <div className="mb-4 inline-flex rounded-lg bg-[#CFE0DC] p-3 text-[#1d3b39]">
              <LockKeyhole size={24} />
            </div>
            <h2 className="text-2xl font-bold">Авторизация</h2>
            <p className="mt-2 text-sm text-slate-500">Демо-доступ администратора: admin / admin123</p>
          </div>

          <label className="mb-4 block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Логин</span>
            <input
              value={login}
              onChange={(event) => setLogin(event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-950"
              autoComplete="username"
              required
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Пароль</span>
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-950"
              autoComplete="current-password"
              required
            />
          </label>

          {error && <p className="mt-4 rounded-lg border border-[#BF1238]/25 bg-[#BF1238]/10 px-4 py-3 text-sm font-semibold text-[#9e1130]">{error}</p>}

          <button type="submit" className="brand-primary-button mt-6 w-full rounded-lg px-5 py-4 text-sm font-bold text-white">
            Войти
          </button>
        </form>
      </section>
    </main>
  );
}

import React, { useEffect, useState } from 'react';
import { BookOpen, LogOut, Menu, Sparkles, WandSparkles } from 'lucide-react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Logo from '@/components/brand/Logo';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

export default function DashboardLayout({ session }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { if (!session.authenticated) navigate('/login', { replace: true }); }, [navigate, session.authenticated]);
  if (!session.authenticated) return null;

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/login';
  }

  return (
    <div className="min-h-screen">
      <div className="page-shell py-4 lg:py-6">
        <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside
            className={cn(
              'surface-panel fixed inset-y-4 left-4 z-40 w-[280px] rounded-[32px] p-5 transition-transform lg:sticky lg:top-6 lg:block lg:h-[calc(100vh-3rem)] lg:translate-x-0',
              mobileOpen ? 'translate-x-0' : '-translate-x-[120%]',
              'lg:translate-x-0'
            )}
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between">
                <Logo to="/library" />
                <button className="rounded-full p-2 text-muted-foreground lg:hidden" onClick={() => setMobileOpen(false)} type="button">
                  <Menu className="h-5 w-5" />
                </button>
              </div>
              <Button className="mt-8 w-full" variant="secondary" onClick={() => navigate('/create')}>
                <WandSparkles className="h-4 w-4" />
                New study set
              </Button>
              <div className="mt-8 space-y-2">
                <NavLink icon={BookOpen} label="Library" active={location.pathname === '/library'} to="/library" />
                <NavLink icon={Sparkles} label="Create with AI" active={location.pathname === '/create'} to="/create" />
              </div>
              <div className="mt-8 rounded-[28px] bg-muted/80 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">Workflow</div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Prompt the AI, trim the deck, then switch into focused review without leaving the app.
                </p>
              </div>
              <div className="mt-auto">
                <Separator className="mb-4 mt-6" />
                <div className="flex items-center gap-3">
                  <Avatar>{session.username?.slice(0, 1)?.toUpperCase() || '?'}</Avatar>
                  <div className="min-w-0">
                    <div className="truncate font-semibold">{session.username}</div>
                    <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Signed in</div>
                  </div>
                </div>
                <Button className="mt-4 w-full" variant="outline" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                  Log out
                </Button>
              </div>
            </div>
          </aside>

          {mobileOpen ? <button className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setMobileOpen(false)} type="button" /> : null}

          <main className="min-w-0">
            <div className="surface-panel mb-4 flex items-center justify-between rounded-[28px] px-4 py-3 lg:hidden">
              <Logo to="/library" />
              <Button size="icon" variant="outline" onClick={() => setMobileOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
            </div>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}

function NavLink({ icon: Icon, label, to, active }) {
  return (
    <Link
      className={cn(
        'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition',
        active ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/15' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
      to={to}
    >
      <Icon className="h-4 w-4" />
      {label}
    </Link>
  );
}

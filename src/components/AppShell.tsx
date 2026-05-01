import { Link, useRouterState } from "@tanstack/react-router";
import { Activity, CalendarDays, Dumbbell, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import logo from "@/assets/logo.png";

const tabs = [
  { to: "/", label: "Dashboard", icon: Activity },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/plan", label: "Plan", icon: Dumbbell },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const { location } = useRouterState();
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border/50">
        <div className="mx-auto max-w-3xl px-5 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <img src={logo} alt="It's Time logo" width={28} height={28} className="h-7 w-7 drop-shadow-[0_0_8px_hsl(var(--primary)/0.4)]" />
            <span className="font-semibold tracking-tight">It's Time</span>
          </Link>
          <Link to="/settings" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Coach Settings
          </Link>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-3xl px-5 pb-28 pt-6 animate-fade-in">
        {children}
      </main>

      <nav className="fixed bottom-0 inset-x-0 z-40 border-t border-border/50 bg-background/80 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto max-w-3xl grid grid-cols-4">
          {tabs.map(({ to, label, icon: Icon }) => {
            const active = to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex flex-col items-center gap-1 py-3 text-[11px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className={cn("h-5 w-5 transition-transform", active && "scale-110")} />
                {label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
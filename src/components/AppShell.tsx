import { Link, useRouterState } from "@tanstack/react-router";
import { Activity, CalendarDays, Dumbbell, Settings, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { InstallPrompt } from "./InstallPrompt";
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
    <div className="min-h-screen flex flex-col font-sans">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border/50 pt-[env(safe-area-inset-top)]">
        <div className="mx-auto max-w-3xl px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="h-8 w-8 rounded-full overflow-hidden flex items-center justify-center shadow-[0_0_15px_hsl(var(--primary))] ring-1 ring-primary/20">
              <img src={logo} alt="It's Time logo" className="h-full w-full object-cover scale-[1.25] object-center" />
            </div>
            <span className="font-bold tracking-tight text-base sm:text-lg">It's Time</span>
          </Link>
          <Link to="/settings" className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 px-2 py-1">
            <Moon className="h-4 w-4" />
            <span className="text-[10px] uppercase tracking-wider font-semibold hidden xs:inline-block">Coach Settings</span>
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

      <InstallPrompt />
    </div>
  );
}
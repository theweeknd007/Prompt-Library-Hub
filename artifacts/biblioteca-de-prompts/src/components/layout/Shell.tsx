import React from "react";
import { Link, useLocation } from "wouter";
import { Home, Compass, Heart, User, LogOut, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useLogout } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => logout(),
    });
  };

  const navItems = [
    { href: "/dashboard", label: "Início", icon: Home },
    { href: "/explore", label: "Explorar", icon: Compass },
    { href: "/favorites", label: "Favoritos", icon: Heart },
    { href: "/profile", label: "Perfil", icon: User },
  ];

  return (
    <div className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50 border-r bg-card border-card-border">
      <div className="p-6 flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 bg-primary/20 rounded-lg border border-primary/50 text-primary">
          <svg width="24" height="24" viewBox="0 0 716 716" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M508.749 317.399C516.777 287.314 508.991 253.884 485.389 230.282C461.788 206.681 428.36 198.895 398.273 206.923C376.231 184.928 343.39 174.956 311.148 183.596C278.906 192.234 255.45 217.292 247.36 247.361C217.291 255.451 192.233 278.91 183.595 311.149C174.957 343.391 184.927 376.232 206.924 398.274C198.896 428.359 206.683 461.789 230.284 485.391C253.885 508.992 287.313 516.779 317.401 508.75C339.442 530.745 372.286 540.717 404.525 532.079C436.767 523.441 460.223 498.384 468.313 468.315C498.383 460.224 523.44 436.766 532.078 404.526C540.716 372.285 530.747 339.443 508.749 317.402V317.399ZM470.899 244.776C486.892 260.77 493.488 282.601 490.687 303.412L415.577 260.046C412.411 258.218 408.509 258.218 405.345 260.046L317.401 310.82V277.526C317.401 275.191 318.652 273.005 320.676 271.837L387.644 233.174C414.178 218.353 448.346 222.223 470.901 244.776H470.899ZM357.837 311.144L398.275 334.491V381.185L357.837 404.532L317.398 381.185V334.491L357.837 311.144ZM264.776 269.693C265.207 239.305 285.644 211.649 316.453 203.393C338.3 197.54 360.505 202.744 377.127 215.573L302.014 258.937C298.848 260.764 296.898 264.144 296.898 267.798V369.346L268.065 352.699C266.043 351.531 264.776 349.353 264.776 347.017V269.691V269.693ZM203.391 316.454C209.244 294.608 224.854 277.978 244.276 269.999V356.73C244.276 360.384 246.226 363.763 249.392 365.591L337.337 416.365L308.503 433.013C306.481 434.181 303.961 434.188 301.939 433.02L234.971 394.357C208.868 378.789 195.138 347.261 203.391 316.454ZM244.775 470.9C228.781 454.906 222.186 433.075 224.986 412.264L300.096 455.63C303.263 457.457 307.164 457.457 310.328 455.63L398.273 404.856V438.149C398.273 440.485 397.022 442.671 394.997 443.839L328.029 482.502C301.495 497.322 267.327 493.452 244.772 470.9H244.775ZM450.897 445.982C450.466 476.371 430.029 504.027 399.22 512.283C377.373 518.136 355.168 512.932 338.547 500.102L413.659 456.738C416.826 454.911 418.775 451.532 418.775 447.877V346.329L447.609 362.977C449.631 364.145 450.897 366.323 450.897 368.659V445.985V445.982ZM512.282 399.221C506.429 421.068 490.819 437.697 471.397 445.676V358.946C471.397 355.292 469.448 351.912 466.281 350.085L378.336 299.311L407.17 282.663C409.192 281.495 411.712 281.487 413.734 282.655L480.702 321.318C506.805 336.887 520.536 368.415 512.282 399.221Z"/>
          </svg>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-lg leading-tight">BIBLIOTECA</span>
          <span className="font-bold text-primary text-sm leading-tight">DE PROMPT</span>
        </div>
      </div>

      <div className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
        <div className="mb-4">
          <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Menu</p>
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = location === item.href || location.startsWith(item.href + '/');
              const Icon = item.icon;
              
              return (
                <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${isActive ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}>
                  <Icon size={18} className={isActive ? "text-primary" : ""} />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
        
        <div className="mb-4 pt-4 border-t border-border/50">
          <p className="px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Criação</p>
          <div className="space-y-1">
            <Link href="/generate" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${location === '/generate' ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}>
              <div className="w-5 h-5 rounded flex items-center justify-center bg-primary/20 text-primary">✨</div>
              Gerar com IA
            </Link>
            <Link href="/my-prompts" className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${location === '/my-prompts' ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}>
              <div className="w-5 h-5 rounded flex items-center justify-center bg-secondary text-foreground">✍️</div>
              Meus Prompts
            </Link>
          </div>
        </div>
      </div>

      {user && (
        <div className="p-4 border-t border-border/50">
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-medium border border-border">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.plan} plan</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={handleLogout} disabled={logoutMutation.isPending}>
            <LogOut size={16} className="mr-2" />
            Sair
          </Button>
        </div>
      )}
    </div>
  );
}

export function BottomNav() {
  const [location] = useLocation();

  const navItems = [
    { href: "/dashboard", label: "Início", icon: Home },
    { href: "/explore", label: "Explorar", icon: Compass },
    { href: "/generate", label: "Gerar IA", icon: () => <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white shadow-[0_0_10px_rgba(225,29,72,0.6)]">✨</div> },
    { href: "/favorites", label: "Favoritos", icon: Heart },
    { href: "/profile", label: "Perfil", icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-card-border pb-safe">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = location === item.href || (item.href !== '/dashboard' && location.startsWith(item.href));
          
          return (
            <Link key={item.href} href={item.href} className={`flex flex-col items-center justify-center w-full h-full gap-1 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
              {typeof item.icon === 'function' ? item.icon() : <item.icon size={20} className={isActive ? "text-primary" : ""} />}
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function Shell({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [location, setLocation] = useLocation();

  // Redirect to login if not authenticated and trying to access protected routes
  React.useEffect(() => {
    if (!isLoading && !user) {
      const publicPaths = ['/', '/login', '/register'];
      if (!publicPaths.includes(location) && !location.startsWith('/prompts/')) {
        setLocation('/login');
      }
    }
  }, [user, isLoading, location, setLocation]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background"><div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div></div>;
  }

  // If on a public page and not logged in, just render children
  const isPublicPage = ['/', '/login', '/register'].includes(location);
  if (isPublicPage && !user) {
    return <div className="min-h-[100dvh] bg-background text-foreground flex flex-col">{children}</div>;
  }

  return (
    <div className="min-h-[100dvh] bg-background text-foreground flex">
      <Sidebar />
      <div className="flex-1 flex flex-col md:ml-64 min-w-0 pb-16 md:pb-0">
        {children}
      </div>
      <BottomNav />
    </div>
  );
}

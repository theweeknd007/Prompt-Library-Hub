import { useAuth } from "@/contexts/AuthContext";
import { useGetStats, useGetSubscription, getGetSubscriptionQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Settings, LogOut, FileText, Heart, Activity, Star } from "lucide-react";
import { useLogout } from "@workspace/api-client-react";
import { Link } from "wouter";

export default function Profile() {
  const { user, logout } = useAuth();
  const { data: stats, isLoading: isLoadingStats } = useGetStats();
  const { data: subscription, isLoading: isLoadingSub } = useGetSubscription({
    query: { queryKey: getGetSubscriptionQueryKey(), retry: false }
  });
  
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => logout()
    });
  };

  if (!user) return null;

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-primary/20 text-primary rounded-lg">
          <Settings size={24} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Perfil & Configurações</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Card */}
        <Card className="lg:col-span-1 bg-card border-card-border h-fit">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center text-3xl font-bold text-primary mb-4 shadow-[0_0_15px_rgba(225,29,72,0.2)]">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold mb-1">{user.name}</h2>
            <p className="text-muted-foreground text-sm mb-4">{user.email}</p>
            
            <Badge className="mb-6 px-3 py-1 bg-secondary text-secondary-foreground uppercase tracking-wider text-xs font-bold border border-border">
              Plano {user.plan}
            </Badge>
            
            <div className="w-full space-y-3 pt-6 border-t border-border">
              <Link href="/plans">
                <Button variant="outline" className="w-full">
                  Fazer Upgrade
                </Button>
              </Link>
              <Button variant="ghost" className="w-full text-destructive hover:text-destructive hover:bg-destructive/10" onClick={handleLogout} disabled={logoutMutation.isPending}>
                <LogOut size={16} className="mr-2" />
                Sair da Conta
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats & Info */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="bg-card border-card-border">
            <CardHeader>
              <CardTitle>Estatísticas de Uso</CardTitle>
              <CardDescription>O impacto dos seus prompts na plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingStats ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
                </div>
              ) : stats ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-secondary/50 rounded-xl p-4 flex flex-col items-center justify-center text-center border border-border/50">
                    <FileText size={24} className="text-muted-foreground mb-2" />
                    <span className="text-2xl font-bold">{stats.totalPrompts}</span>
                    <span className="text-xs text-muted-foreground mt-1">Prompts Criados</span>
                  </div>
                  <div className="bg-secondary/50 rounded-xl p-4 flex flex-col items-center justify-center text-center border border-border/50">
                    <Heart size={24} className="text-primary mb-2" />
                    <span className="text-2xl font-bold">{stats.favoritePrompts}</span>
                    <span className="text-xs text-muted-foreground mt-1">Favoritos</span>
                  </div>
                  <div className="bg-secondary/50 rounded-xl p-4 flex flex-col items-center justify-center text-center border border-border/50">
                    <Activity size={24} className="text-green-500 mb-2" />
                    <span className="text-2xl font-bold">{stats.totalUses}</span>
                    <span className="text-xs text-muted-foreground mt-1">Vezes Usados</span>
                  </div>
                  <div className="bg-secondary/50 rounded-xl p-4 flex flex-col items-center justify-center text-center border border-border/50">
                    <Star size={24} className="text-yellow-500 mb-2" />
                    <span className="text-2xl font-bold">{stats.totalLikes}</span>
                    <span className="text-xs text-muted-foreground mt-1">Likes Recebidos</span>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="bg-card border-card-border">
            <CardHeader>
              <CardTitle>Assinatura Atual</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingSub ? (
                <Skeleton className="h-20" />
              ) : subscription ? (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-border rounded-lg bg-secondary/20">
                  <div>
                    <h3 className="font-bold text-lg">{subscription.planName}</h3>
                    <p className="text-sm text-muted-foreground">Status: <span className="text-green-500 font-medium capitalize">{subscription.status}</span></p>
                    {subscription.expiresAt && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Renova em: {new Date(subscription.expiresAt).toLocaleDateString('pt-BR')}
                      </p>
                    )}
                  </div>
                  <div className="mt-4 sm:mt-0 text-right">
                    <p className="font-bold text-xl">${subscription.price}<span className="text-sm font-normal text-muted-foreground">/mês</span></p>
                  </div>
                </div>
              ) : (
                <div className="p-4 border border-border rounded-lg bg-secondary/20 text-center">
                  <p className="text-muted-foreground mb-4">Você está no plano Básico (Gratuito).</p>
                  <Link href="/plans">
                    <Button variant="outline" size="sm">Fazer Upgrade</Button>
                  </Link>
                </div>
              )}

              {stats && (
                <div className="mt-8 space-y-6">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Uso da IA ({new Date().toLocaleDateString('pt-BR', { month: 'long' })})</span>
                      <span className="font-medium">{stats.aiGenerationsUsed} / {stats.aiGenerationsLimit}</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary" 
                        style={{ width: `${Math.min(100, (stats.aiGenerationsUsed / stats.aiGenerationsLimit) * 100)}%` }}
                      />
                    </div>
                  </div>
                  
                  {stats.promptsLimit != null && (
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Lados de Prompts Criados</span>
                        <span className="font-medium">{stats.totalPrompts} / {stats.promptsLimit}</span>
                      </div>
                      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <div 
                        className="h-full bg-primary"
                        style={{ width: `${Math.min(100, (stats.totalPrompts / stats.promptsLimit) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

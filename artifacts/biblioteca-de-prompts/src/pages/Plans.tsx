import { Check, Zap, Star, Shield, ArrowRight } from "lucide-react";
import { useListPlans, useGetSubscription, useCreateSubscription } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function Plans() {
  const { data: plans, isLoading: isLoadingPlans } = useListPlans();
  const { data: subscription, isLoading: isLoadingSub } = useGetSubscription({
    query: { retry: false } // Will error if no subscription, which is fine
  });
  
  const createSubMutation = useCreateSubscription();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubscribe = (planSlug: any) => {
    createSubMutation.mutate({ data: { planSlug } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/subscriptions/current'] });
        queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
        toast({
          title: "Plano atualizado!",
          description: `Seu plano foi alterado com sucesso.`,
        });
      },
      onError: (err: any) => {
        toast({
          variant: "destructive",
          title: "Erro ao atualizar plano",
          description: err.message || "Ocorreu um erro, tente novamente.",
        });
      }
    });
  };

  const getPlanIcon = (slug: string) => {
    switch(slug) {
      case 'basic': return <Shield className="text-blue-400" size={24} />;
      case 'pro': return <Zap className="text-primary" size={24} />;
      case 'premium': return <Star className="text-yellow-400" size={24} />;
      default: return <Shield size={24} />;
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto w-full">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">Preços Simples e Transparentes</Badge>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
          Desbloqueie todo o poder da Biblioteca de Prompts
        </h1>
        <p className="text-xl text-muted-foreground">
          Escolha o plano ideal para suas necessidades. Cancele quando quiser.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {isLoadingPlans ? (
          Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-[500px] rounded-xl bg-card border border-card-border" />)
        ) : plans?.map(plan => {
          const isCurrentPlan = subscription?.planSlug === plan.slug;
          const isPro = plan.slug === 'pro';

          return (
            <Card key={plan.id} className={`relative flex flex-col ${isPro ? 'border-primary shadow-[0_0_30px_rgba(225,29,72,0.15)] scale-105 z-10 bg-[#111]' : 'border-card-border bg-card'}`}>
              {isPro && (
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-rose-400 to-primary" />
              )}
              {isPro && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary">Mais Popular</Badge>
              )}
              
              <CardHeader className="p-8 pb-4">
                <div className="flex items-center gap-3 mb-2">
                  {getPlanIcon(plan.slug)}
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                </div>
                <div className="mt-4 flex items-baseline text-4xl font-bold">
                  <span>${plan.price}</span>
                  <span className="text-lg text-muted-foreground font-normal ml-1">/mês</span>
                </div>
                <p className="text-sm text-muted-foreground mt-4 h-10">
                  {plan.description || `O plano ideal para ${plan.name.toLowerCase()}`}
                </p>
              </CardHeader>
              
              <CardContent className="p-8 pt-4 flex-1">
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <Check className="text-primary shrink-0 mt-0.5" size={18} />
                    <span className="text-sm">
                      {plan.promptsLimit === null ? 'Prompts ilimitados' : `Até ${plan.promptsLimit} prompts salvos`}
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="text-primary shrink-0 mt-0.5" size={18} />
                    <span className="text-sm">
                      {plan.aiGenerationsLimit} gerações com IA por mês
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className={plan.sharingEnabled ? "text-primary shrink-0 mt-0.5" : "text-muted-foreground opacity-50 shrink-0 mt-0.5"} size={18} />
                    <span className={`text-sm ${!plan.sharingEnabled && 'text-muted-foreground opacity-50'}`}>
                      Compartilhamento de prompts
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className={plan.exclusiveTemplates !== 'none' ? "text-primary shrink-0 mt-0.5" : "text-muted-foreground opacity-50 shrink-0 mt-0.5"} size={18} />
                    <span className={`text-sm ${plan.exclusiveTemplates === 'none' && 'text-muted-foreground opacity-50'}`}>
                      {plan.exclusiveTemplates === 'full' ? 'Acesso a todos templates exclusivos' : 
                       plan.exclusiveTemplates === 'partial' ? 'Acesso parcial a templates' : 
                       'Acesso a templates exclusivos'}
                    </span>
                  </li>
                </ul>
              </CardContent>
              
              <CardFooter className="p-8 pt-0">
                <Button 
                  className="w-full h-12 font-bold" 
                  variant={isPro ? 'default' : 'outline'}
                  disabled={isCurrentPlan || createSubMutation.isPending}
                  onClick={() => handleSubscribe(plan.slug)}
                >
                  {isCurrentPlan ? 'Plano Atual' : 
                   createSubMutation.isPending ? 'Processando...' : 
                   'Assinar ' + plan.name}
                  {!isCurrentPlan && !createSubMutation.isPending && <ArrowRight className="ml-2" size={18} />}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

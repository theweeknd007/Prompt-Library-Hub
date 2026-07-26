import { useAuth } from "@/contexts/AuthContext";
import { Link } from "wouter";
import { Search, ChevronRight, Bookmark, ArrowUpRight, Plus, Sparkles, Badge } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PromptCard } from "@/components/PromptCard";
import { useListRecentPrompts, useListCategories } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: recentPrompts, isLoading: isLoadingPrompts } = useListRecentPrompts({ limit: 4 });
  const { data: categories, isLoading: isLoadingCategories } = useListCategories();

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Olá, {user?.name?.split(' ')[0] || 'Criador'} 👋</h1>
          <p className="text-muted-foreground">Pronto para gerar resultados extraordinários hoje?</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/my-prompts">
            <Button variant="outline" className="border-card-border">
              <Plus size={16} className="mr-2" />
              Novo Prompt
            </Button>
          </Link>
          <Link href="/generate">
            <Button className="shadow-[0_0_15px_rgba(225,29,72,0.4)]">
              <Sparkles size={16} className="mr-2" />
              IA Generator
            </Button>
          </Link>
        </div>
      </div>

      <div className="relative mb-12">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
        <Input 
          className="w-full pl-12 h-14 bg-card border-card-border text-lg rounded-xl focus-visible:ring-primary shadow-sm" 
          placeholder="Buscar prompts para copy, imagens, código..."
        />
        <Button className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-6">
          Buscar
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Bookmark className="text-primary" size={20} />
                Prompts Recentes
              </h2>
              <Link href="/explore" className="text-sm text-primary font-medium hover:underline flex items-center">
                Ver todos <ChevronRight size={16} />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {isLoadingPrompts ? (
                Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)
              ) : recentPrompts?.length ? (
                recentPrompts.map(prompt => (
                  <PromptCard key={prompt.id} prompt={prompt} />
                ))
              ) : (
                <div className="col-span-2 p-8 text-center bg-card border border-dashed border-card-border rounded-xl">
                  <p className="text-muted-foreground">Nenhum prompt encontrado.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-card border border-card-border rounded-xl p-6">
            <h2 className="text-lg font-bold mb-4">Categorias Populares</h2>
            <div className="space-y-3">
              {isLoadingCategories ? (
                Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-md" />)
              ) : categories?.slice(0, 5).map(category => (
                <Link key={category.id} href={`/explore?category=${category.slug}`} className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-secondary/50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon || '📁'}</span>
                    <span className="font-medium group-hover:text-primary transition-colors">{category.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground bg-background px-2 py-1 rounded-full">{category.promptCount}</span>
                </Link>
              ))}
            </div>
            <Link href="/explore" className="block mt-4 text-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Explorar todas as categorias
            </Link>
          </section>

          <section className="bg-gradient-to-br from-[#2A0810] to-[#110206] border border-primary/20 rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full" />
            <div className="relative z-10">
              <Badge className="bg-primary/20 text-primary hover:bg-primary/20 border-0 mb-3">Dica Pro</Badge>
              <h3 className="text-lg font-bold mb-2">Acelere com a IA</h3>
              <p className="text-sm text-white/70 mb-4">Descreva o que você precisa e nossa IA gera um prompt otimizado em segundos.</p>
              <Link href="/generate">
                <Button size="sm" className="w-full bg-white text-black hover:bg-white/90">
                  Experimentar Agora <ArrowUpRight size={16} className="ml-1" />
                </Button>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

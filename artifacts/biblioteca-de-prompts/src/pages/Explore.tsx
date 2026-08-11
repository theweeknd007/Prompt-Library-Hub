import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { Search, Compass, SlidersHorizontal, X } from "lucide-react";
import { useListPrompts, useListCategories, ListPromptsVisibility } from "@workspace/api-client-react";
import { PromptCard } from "@/components/PromptCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export default function Explore() {
  const [location] = useLocation();
  const initialParams = useMemo(() => new URLSearchParams(location.split("?")[1] || ""), [location]);
  const [search, setSearch] = useState(initialParams.get("search") || "");
  const [appliedSearch, setAppliedSearch] = useState(initialParams.get("search") || "");
  const [category, setCategory] = useState<string | undefined>(initialParams.get("category") || undefined);
  const [tab, setTab] = useState<"all" | "popular" | "recent">("all");

  const { data: categories, isLoading: isLoadingCategories } = useListCategories();
  
  // Create a debounced search effect
  // In a real app we'd use useDebounce hook, but simple timeout works here
  
  const { data: promptsResponse, isLoading: isLoadingPrompts } = useListPrompts({
    search: appliedSearch || undefined,
    category,
    visibility: "public" as ListPromptsVisibility,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedSearch(search.trim());
  };

  const sortedPrompts = useMemo(() => {
    const prompts = [...(promptsResponse?.prompts || [])];
    if (tab === "popular") return prompts.sort((a, b) => b.useCount - a.useCount);
    if (tab === "recent") return prompts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return prompts;
  }, [promptsResponse?.prompts, tab]);

  const hasFilters = Boolean(appliedSearch || category);

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/20 text-primary rounded-lg">
              <Compass size={24} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Explorar</h1>
          </div>
          <p className="text-muted-foreground">Encontre os melhores prompts da comunidade.</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 bg-card border-card-border h-12"
              aria-label="Pesquisar prompts"
              placeholder="Pesquisar por tema, ferramenta ou objetivo"
            />
          </div>
          <Button type="submit" className="h-12 px-5">Pesquisar</Button>
        </form>
        <div className="relative lg:w-60">
          <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4 pointer-events-none" />
          <select
            value={category || ""}
            onChange={(event) => setCategory(event.target.value || undefined)}
            aria-label="Filtrar por categoria"
            className="flex h-12 w-full appearance-none rounded-md border border-input bg-card pl-9 pr-3 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            disabled={isLoadingCategories}
          >
            <option value="">Todas as categorias</option>
            {categories?.map(cat => (
              <option key={cat.id} value={cat.slug}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <Tabs defaultValue="all" value={tab} onValueChange={(v: any) => setTab(v)}>
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="popular">Mais usados</TabsTrigger>
          <TabsTrigger value="recent">Recentes</TabsTrigger>
        </TabsList>
        </Tabs>
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setSearch(""); setAppliedSearch(""); setCategory(undefined); }}
            className="text-muted-foreground"
          >
            <X size={14} className="mr-1.5" /> Limpar filtros
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoadingPrompts ? (
          Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl bg-card border border-card-border" />)
        ) : sortedPrompts.length ? (
          sortedPrompts.map(prompt => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))
        ) : (
          <div className="col-span-full py-20 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mb-4 text-muted-foreground">
              <Search size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Nenhum prompt encontrado</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Não encontramos nenhum prompt com os filtros atuais. Tente buscar por outros termos ou categorias.
            </p>
             <Button variant="outline" className="mt-6" onClick={() => { setSearch(""); setAppliedSearch(""); setCategory(undefined); }}>
               Limpar filtros
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

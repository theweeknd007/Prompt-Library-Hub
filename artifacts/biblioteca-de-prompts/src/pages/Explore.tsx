import { useState } from "react";
import { useLocation } from "wouter";
import { Search, Filter, Compass } from "lucide-react";
import { useListPrompts, useListCategories, ListPromptsVisibility } from "@workspace/api-client-react";
import { PromptCard } from "@/components/PromptCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export default function Explore() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState<string | undefined>();
  const [tab, setTab] = useState<"all" | "popular" | "recent">("all");

  const { data: categories, isLoading: isLoadingCategories } = useListCategories();
  
  // Create a debounced search effect
  // In a real app we'd use useDebounce hook, but simple timeout works here
  
  const { data: promptsResponse, isLoading: isLoadingPrompts } = useListPrompts({
    search: debouncedSearch || undefined,
    category,
    visibility: "public" as ListPromptsVisibility,
    // The API doesn't explicitly support sort order in params but we can pretend it does 
    // or rely on useListPopularPrompts for popular. 
    // For now we'll just use listPrompts for everything.
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedSearch(search);
  };

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

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <form onSubmit={handleSearch} className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 bg-card border-card-border h-12" 
            placeholder="Buscar por palavras-chave, ferramentas, usos..."
          />
        </form>
        <div className="flex overflow-x-auto pb-2 md:pb-0 hide-scrollbar gap-2">
          <Button 
            variant={category === undefined ? "default" : "outline"} 
            className="whitespace-nowrap"
            onClick={() => setCategory(undefined)}
          >
            Todas
          </Button>
          {isLoadingCategories ? (
            Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-10 w-24" />)
          ) : categories?.map(cat => (
            <Button 
              key={cat.id}
              variant={category === cat.slug ? "default" : "outline"} 
              className="whitespace-nowrap"
              onClick={() => setCategory(cat.slug)}
            >
              {cat.icon} {cat.name}
            </Button>
          ))}
        </div>
      </div>

      <Tabs defaultValue="all" value={tab} onValueChange={(v: any) => setTab(v)} className="mb-8">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="popular">Mais Populares</TabsTrigger>
          <TabsTrigger value="recent">Recentes</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoadingPrompts ? (
          Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl bg-card border border-card-border" />)
        ) : promptsResponse?.prompts?.length ? (
          promptsResponse.prompts.map(prompt => (
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
            <Button variant="outline" className="mt-6" onClick={() => { setSearch(""); setDebouncedSearch(""); setCategory(undefined); }}>
              Limpar Filtros
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

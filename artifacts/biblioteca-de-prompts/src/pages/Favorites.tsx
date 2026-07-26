import { useState } from "react";
import { Heart, Search } from "lucide-react";
import { useListPrompts } from "@workspace/api-client-react";
import { PromptCard } from "@/components/PromptCard";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Favorites() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { data: promptsResponse, isLoading } = useListPrompts({
    search: debouncedSearch || undefined,
    favorites: "true"
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
              <Heart size={24} className="fill-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Favoritos</h1>
          </div>
          <p className="text-muted-foreground">Seu cofre pessoal com seus prompts salvos.</p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="relative mb-8 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
        <Input 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 bg-card border-card-border h-12" 
          placeholder="Buscar em seus favoritos..."
        />
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          Array(8).fill(0).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl bg-card border border-card-border" />)
        ) : promptsResponse?.prompts?.length ? (
          promptsResponse.prompts.map(prompt => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))
        ) : (
          <div className="col-span-full py-20 text-center flex flex-col items-center bg-card border border-card-border border-dashed rounded-xl">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4 text-muted-foreground">
              <Heart size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Seu cofre está vazio</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Você ainda não salvou nenhum prompt. Explore a biblioteca e salve os que mais gostar.
            </p>
            <Link href="/explore">
              <Button>Explorar Biblioteca</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

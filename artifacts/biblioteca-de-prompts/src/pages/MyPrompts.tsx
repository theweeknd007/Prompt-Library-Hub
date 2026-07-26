import { useState } from "react";
import { PenTool, Plus, Lock, Globe } from "lucide-react";
import { useListPrompts, useCreatePrompt, ListPromptsVisibility, PromptInputVisibility, useListCategories } from "@workspace/api-client-react";
import { PromptCard } from "@/components/PromptCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";

export default function MyPrompts() {
  const [tab, setTab] = useState<"all" | "public" | "private">("all");

  const visibilityMap = {
    all: "all" as ListPromptsVisibility,
    public: "public" as ListPromptsVisibility,
    private: "private" as ListPromptsVisibility,
  };

  const { data: promptsResponse, isLoading } = useListPrompts({
    visibility: visibilityMap[tab]
  });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/20 text-primary rounded-lg">
              <PenTool size={24} />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Meus Prompts</h1>
          </div>
          <p className="text-muted-foreground">Gerencie os prompts criados por você.</p>
        </div>
        
        <Link href="/my-prompts/new">
          <Button className="font-bold">
            <Plus size={18} className="mr-2" />
            Criar Prompt
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="all" value={tab} onValueChange={(v: any) => setTab(v)} className="mb-8">
        <TabsList className="bg-card border border-border">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="public" className="gap-2"><Globe size={14} /> Públicos</TabsTrigger>
          <TabsTrigger value="private" className="gap-2"><Lock size={14} /> Privados</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-64 rounded-xl bg-card border border-card-border" />)
        ) : promptsResponse?.prompts?.length ? (
          promptsResponse.prompts.map(prompt => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))
        ) : (
          <div className="col-span-full py-20 text-center flex flex-col items-center bg-card border border-card-border border-dashed rounded-xl">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4 text-muted-foreground">
              <PenTool size={32} />
            </div>
            <h3 className="text-xl font-bold mb-2">Nenhum prompt encontrado</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              {tab === "all" 
                ? "Você ainda não criou nenhum prompt."
                : `Você não possui prompts ${tab === "public" ? "públicos" : "privados"}.`
              }
            </p>
            <Link href="/my-prompts/new">
              <Button>Criar meu primeiro prompt</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

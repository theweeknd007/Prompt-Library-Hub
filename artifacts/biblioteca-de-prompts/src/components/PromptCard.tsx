import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Copy, Heart, ArrowUpRight } from "lucide-react";
import { Prompt, useToggleFavorite, useRecordUse } from "@workspace/api-client-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { MouseEvent } from "react";

interface PromptCardProps {
  prompt: Prompt;
}

export function PromptCard({ prompt }: PromptCardProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const toggleFavorite = useToggleFavorite();
  const recordUse = useRecordUse();

  const handleFavorite = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (toggleFavorite.isPending) return;

    toggleFavorite.mutate({ id: prompt.id }, {
      onSuccess: () => {
        // Optimistic update would be better, but refetching lists is safer
        queryClient.invalidateQueries({ queryKey: ['/api/prompts'] });
        queryClient.invalidateQueries({ queryKey: ['/api/prompts/popular'] });
        queryClient.invalidateQueries({ queryKey: ['/api/prompts/recent'] });
        toast({
          title: prompt.isFavorite ? "Removido dos favoritos" : "Adicionado aos favoritos",
          description: prompt.title,
        });
      }
    });
  };

  const handleCopy = async (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (recordUse.isPending) return;

    try {
      await navigator.clipboard.writeText(prompt.content);
      recordUse.mutate({ id: prompt.id });
      toast({
        title: "Prompt copiado",
        description: "Já pode colá-lo na sua ferramenta de IA.",
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Não foi possível copiar",
        description: "Selecione e copie o conteúdo na página do prompt.",
      });
    }
  };

  return (
    <Card className="h-full flex flex-col hover-elevate transition-all border-card-border hover:border-primary/50 group bg-card overflow-hidden">
      <CardHeader className="p-5 pb-3">
        <div className="flex justify-between items-start gap-3 mb-4">
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] uppercase tracking-wider">
            {prompt.categoryName}
          </Badge>
          <button
            type="button"
            onClick={handleFavorite}
            disabled={toggleFavorite.isPending}
            aria-label={prompt.isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
            aria-pressed={prompt.isFavorite}
            className={`min-h-11 min-w-11 -mr-2 -mt-2 flex items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${prompt.isFavorite ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}
          >
            <Heart size={18} className={prompt.isFavorite ? "fill-current" : ""} />
          </button>
        </div>
        <Link href={`/prompts/${prompt.id}`} className="group/title focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
          <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover/title:text-primary transition-colors">
            {prompt.title}
          </h3>
        </Link>
      </CardHeader>

      <CardContent className="px-5 pb-5 pt-0 flex-1">
        <Link href={`/prompts/${prompt.id}`} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {prompt.description || prompt.content}
          </p>
        </Link>
      </CardContent>

      <CardFooter className="p-4 border-t border-border/10 mt-auto bg-secondary/20 flex items-center gap-2">
        <Button asChild size="sm" className="flex-1 min-h-10">
          <Link href={`/prompts/${prompt.id}`}>
            Ver prompt <ArrowUpRight size={14} className="ml-1.5" />
          </Link>
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="min-h-10 min-w-10"
          onClick={handleCopy}
          disabled={recordUse.isPending}
          aria-label="Copiar prompt"
          title="Copiar prompt"
        >
          <Copy size={15} />
        </Button>
      </CardFooter>
    </Card>
  );
}

import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Copy, Heart, MessageSquare, Star, ArrowRight } from "lucide-react";
import { Prompt, useToggleFavorite, getListPromptsQueryKey, useRecordUse } from "@workspace/api-client-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface PromptCardProps {
  prompt: Prompt;
}

export function PromptCard({ prompt }: PromptCardProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const toggleFavorite = useToggleFavorite();
  const recordUse = useRecordUse();

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
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

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    navigator.clipboard.writeText(prompt.content);
    recordUse.mutate({ id: prompt.id });
    
    toast({
      title: "Prompt copiado!",
      description: "Conteúdo copiado para a área de transferência.",
    });
  };

  return (
    <Link href={`/prompts/${prompt.id}`}>
      <Card className="h-full flex flex-col hover-elevate transition-all border-card-border hover:border-primary/50 cursor-pointer group bg-card overflow-hidden">
        <CardHeader className="p-4 pb-2">
          <div className="flex justify-between items-start mb-2">
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px] uppercase tracking-wider">
              {prompt.categoryName}
            </Badge>
            <button 
              onClick={handleFavorite}
              className={`p-1.5 rounded-full transition-colors ${prompt.isFavorite ? 'text-primary bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}
            >
              <Heart size={16} className={prompt.isFavorite ? "fill-current" : ""} />
            </button>
          </div>
          <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {prompt.title}
          </h3>
        </CardHeader>
        
        <CardContent className="p-4 pt-2 flex-1">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {prompt.description || prompt.content}
          </p>
        </CardContent>
        
        <CardFooter className="p-4 pt-0 flex justify-between items-center border-t border-border/10 mt-auto bg-secondary/30">
          <div className="flex gap-3 text-xs text-muted-foreground mt-3">
            <div className="flex items-center gap-1">
              <Star size={12} className="text-yellow-500 fill-current" />
              <span>{prompt.rating.toFixed(1)}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare size={12} />
              <span>Usado {prompt.useCount > 1000 ? `${(prompt.useCount/1000).toFixed(1)}k` : prompt.useCount}x</span>
            </div>
          </div>
          
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-8 w-8 p-0 rounded-full mt-3 opacity-0 group-hover:opacity-100 transition-opacity bg-primary/10 text-primary hover:bg-primary hover:text-white"
            onClick={handleCopy}
            title="Copiar prompt"
          >
            <Copy size={14} />
          </Button>
        </CardFooter>
      </Card>
    </Link>
  );
}

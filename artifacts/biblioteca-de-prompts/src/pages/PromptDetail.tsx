import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useGetPrompt, useToggleFavorite, useToggleLike, useRecordUse, getGetPromptQueryKey } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Heart, ThumbsUp, Copy, CheckCircle2, ChevronLeft, Calendar, User, Eye, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function PromptDetail() {
  const { id } = useParams();
  const promptId = parseInt(id || "0", 10);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [copied, setCopied] = useState(false);

  const { data: prompt, isLoading, error } = useGetPrompt(promptId, {
    query: { queryKey: getGetPromptQueryKey(promptId), enabled: !!promptId }
  });

  const toggleFavorite = useToggleFavorite();
  const toggleLike = useToggleLike();
  const recordUse = useRecordUse();

  const handleFavorite = () => {
    if (!prompt) return;
    toggleFavorite.mutate({ id: prompt.id }, {
      onSuccess: () => {
        // Simple invalidation to get fresh data
        queryClient.invalidateQueries({ queryKey: ['/api/prompts', prompt.id] });
        toast({ title: prompt.isFavorite ? "Removido dos favoritos" : "Adicionado aos favoritos" });
      }
    });
  };

  const handleLike = () => {
    if (!prompt) return;
    toggleLike.mutate({ id: prompt.id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/prompts', prompt.id] });
      }
    });
  };

  const handleCopy = () => {
    if (!prompt) return;
    navigator.clipboard.writeText(prompt.content);
    setCopied(true);
    recordUse.mutate({ id: prompt.id });
    
    toast({ title: "Prompt copiado!", description: "Conteúdo copiado para a área de transferência." });
    setTimeout(() => setCopied(false), 2000);
  };

  if (error) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold mb-4 text-destructive">Erro ao carregar prompt</h2>
        <Link href="/explore"><Button>Voltar para Explorar</Button></Link>
      </div>
    );
  }

  if (isLoading || !prompt) {
    return (
      <div className="p-6 md:p-8 max-w-5xl mx-auto w-full space-y-6">
        <Skeleton className="h-8 w-32 mb-8" />
        <Skeleton className="h-12 w-3/4 mb-4" />
        <div className="flex gap-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-64 w-full mt-8" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto w-full">
      <Link href="/explore" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
        <ChevronLeft size={16} className="mr-1" />
        Voltar para explorar
      </Link>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 space-y-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Badge className="bg-primary/20 text-primary hover:bg-primary/20 border-0 uppercase tracking-wider text-xs">
                {prompt.categoryName}
              </Badge>
              {prompt.visibility === 'private' && (
                <Badge variant="secondary" className="uppercase tracking-wider text-xs bg-secondary">
                  Privado
                </Badge>
              )}
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-4">
              {prompt.title}
            </h1>
            
            <p className="text-lg text-muted-foreground">
              {prompt.description || "Sem descrição disponível."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 py-4 border-y border-border/50 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <User size={16} />
              <span>{prompt.authorName || "Anônimo"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              <span>{new Date(prompt.createdAt).toLocaleDateString('pt-BR')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye size={16} />
              <span>Usado {prompt.useCount} vezes</span>
            </div>
            <div className="flex items-center gap-2">
              <ThumbsUp size={16} />
              <span>{prompt.likeCount} likes</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Conteúdo do Prompt</h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleFavorite} className={prompt.isFavorite ? "text-primary border-primary/50 bg-primary/10" : ""}>
                  <Heart size={16} className={prompt.isFavorite ? "fill-current mr-2" : "mr-2"} />
                  {prompt.isFavorite ? "Salvo" : "Salvar"}
                </Button>
                <Button variant="outline" size="sm" onClick={handleLike}>
                  <ThumbsUp size={16} className="mr-2" />
                  Gostei
                </Button>
              </div>
            </div>
            
            <Card className="bg-[#111] border-card-border overflow-hidden">
              <div className="bg-secondary/50 px-4 py-2 border-b border-border flex justify-between items-center">
                <span className="text-xs font-mono text-muted-foreground">prompt.txt</span>
                <Button size="sm" variant="ghost" className="h-8 text-primary hover:text-primary-foreground hover:bg-primary" onClick={handleCopy}>
                  {copied ? <CheckCircle2 size={14} className="mr-2" /> : <Copy size={14} className="mr-2" />}
                  {copied ? "Copiado!" : "Copiar"}
                </Button>
              </div>
              <CardContent className="p-6 overflow-auto">
                <pre className="text-sm font-mono whitespace-pre-wrap leading-relaxed text-foreground/90">
                  {prompt.content}
                </pre>
              </CardContent>
            </Card>

            <Button className="w-full h-14 text-lg font-bold shadow-[0_0_15px_rgba(225,29,72,0.4)]" onClick={handleCopy}>
              <Play size={20} className="mr-2" />
              Usar este prompt
            </Button>
          </div>

          {prompt.tags && prompt.tags.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-3">Tags</h3>
              <div className="flex gap-2 flex-wrap">
                {prompt.tags.map(tag => (
                  <Badge key={tag} variant="secondary">#{tag}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="md:w-80 shrink-0 space-y-6">
          <Card className="bg-card border-card-border">
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="font-bold flex items-center gap-2 mb-3 text-green-400">
                  <CheckCircle2 size={18} /> Ideal para:
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2"><span className="text-green-400">•</span> Produtividade</li>
                  <li className="flex gap-2"><span className="text-green-400">•</span> Qualidade consistente</li>
                  <li className="flex gap-2"><span className="text-green-400">•</span> Economia de tempo</li>
                </ul>
              </div>
              
              <div className="pt-6 border-t border-border">
                <h3 className="font-bold mb-2">Sobre o autor</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold">
                    {(prompt.authorName || "A")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{prompt.authorName || "Anônimo"}</p>
                    <p className="text-xs text-muted-foreground">Criador na comunidade</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

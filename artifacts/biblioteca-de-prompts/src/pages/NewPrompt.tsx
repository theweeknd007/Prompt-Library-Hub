import { useState } from "react";
import { Link, useLocation } from "wouter";
import { ChevronLeft, Save } from "lucide-react";
import { useCreatePrompt, useListCategories } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export default function NewPrompt() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: categories, isLoading: isCategoriesLoading } = useListCategories();
  const createPromptMutation = useCreatePrompt();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [tags, setTags] = useState("");
  const [visibility, setVisibility] = useState<"public" | "private">("public");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !content || !categoryId) {
      toast({
        variant: "destructive",
        title: "Campos obrigatórios",
        description: "Preencha o título, conteúdo e categoria."
      });
      return;
    }

    const tagsList = tags.split(",").map(t => t.trim()).filter(t => t);

    createPromptMutation.mutate({
      data: {
        title,
        content,
        description,
        categoryId: parseInt(categoryId, 10),
        tags: tagsList.length > 0 ? tagsList : undefined,
        visibility
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/prompts'] });
        toast({ title: "Prompt criado com sucesso!" });
        setLocation("/my-prompts");
      },
      onError: (err: any) => {
        toast({
          variant: "destructive",
          title: "Erro ao criar prompt",
          description: err.message || "Tente novamente mais tarde."
        });
      }
    });
  };

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto w-full">
      <Link href="/my-prompts" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6 transition-colors">
        <ChevronLeft size={16} className="mr-1" />
        Voltar para meus prompts
      </Link>

      <h1 className="text-3xl font-bold tracking-tight mb-8">Criar Novo Prompt</h1>

      <form onSubmit={handleSubmit}>
        <Card className="bg-card border-card-border">
          <CardHeader>
            <CardTitle>Detalhes do Prompt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="space-y-2">
              <Label htmlFor="title">Título <span className="text-primary">*</span></Label>
              <Input 
                id="title" 
                placeholder="Dê um nome descritivo ao seu prompt" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição (Opcional)</Label>
              <Textarea 
                id="description" 
                placeholder="Explique para que serve este prompt e como usá-lo" 
                className="min-h-[80px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Conteúdo do Prompt <span className="text-primary">*</span></Label>
              <Textarea 
                id="content" 
                placeholder="Escreva o prompt exatamente como ele será copiado para a IA..." 
                className="min-h-[200px] font-mono"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="category">Categoria <span className="text-primary">*</span></Label>
                <select 
                  id="category"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  {categories?.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="visibility">Visibilidade</Label>
                <select 
                  id="visibility"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as "public" | "private")}
                >
                  <option value="public">Público (Compartilhar com a comunidade)</option>
                  <option value="private">Privado (Apenas eu)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
              <Input 
                id="tags" 
                placeholder="ex: marketing, linkedin, copywriting" 
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>

            <div className="pt-6 border-t border-border flex justify-end gap-4">
              <Link href="/my-prompts">
                <Button type="button" variant="outline">Cancelar</Button>
              </Link>
              <Button type="submit" disabled={createPromptMutation.isPending} className="font-bold">
                <Save size={16} className="mr-2" />
                {createPromptMutation.isPending ? "Salvando..." : "Salvar Prompt"}
              </Button>
            </div>
            
          </CardContent>
        </Card>
      </form>
    </div>
  );
}

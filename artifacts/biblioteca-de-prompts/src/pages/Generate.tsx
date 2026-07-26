import { useState } from "react";
import { Sparkles, ArrowRight, Save, Copy, CheckCircle2 } from "lucide-react";
import { useGeneratePrompt, useListCategories } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function Generate() {
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState("");
  const [style, setStyle] = useState("");
  const [copied, setCopied] = useState(false);
  
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const generateMutation = useGeneratePrompt();
  const { data: categories } = useListCategories();

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    generateMutation.mutate({
      data: {
        topic,
        category: category || undefined,
        style: style || undefined
      }
    });
  };

  const handleCopy = () => {
    if (generateMutation.data?.content) {
      navigator.clipboard.writeText(generateMutation.data.content);
      setCopied(true);
      toast({ title: "Copiado!", description: "Prompt copiado para a área de transferência." });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSave = () => {
    // In a real app we would open a save dialog or automatically save
    // For now we just simulate it
    toast({ title: "Prompt Salvo", description: "O prompt foi salvo na sua biblioteca." });
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 bg-primary/20 text-primary rounded-lg">
          <Sparkles size={24} />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Gerador de Prompts com IA</h1>
      </div>
      <p className="text-muted-foreground mb-8">Descreva o que você precisa e nossa IA cria o prompt perfeito para você usar no ChatGPT, Claude ou outras IAs.</p>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Card className="lg:col-span-5 bg-card border-card-border h-fit">
          <CardHeader>
            <CardTitle className="text-xl">O que você precisa?</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerate} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="topic">Tópico / Objetivo <span className="text-primary">*</span></Label>
                <Textarea 
                  id="topic" 
                  placeholder="Ex: Quero escrever um post para LinkedIn sobre os benefícios da inteligência artificial no marketing..." 
                  className="min-h-[120px]"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria (Opcional)</Label>
                <select 
                  id="category"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">Selecione uma categoria</option>
                  {categories?.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="style">Estilo / Tom de voz (Opcional)</Label>
                <Input 
                  id="style" 
                  placeholder="Ex: Profissional, persuasivo, humorístico..." 
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full font-bold h-12 text-md shadow-[0_0_15px_rgba(225,29,72,0.4)]"
                disabled={!topic.trim() || generateMutation.isPending}
              >
                {generateMutation.isPending ? (
                  <>Gerando mágica... <Sparkles className="ml-2 h-4 w-4 animate-spin" /></>
                ) : (
                  <>Gerar Prompt <ArrowRight className="ml-2 h-4 w-4" /></>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="lg:col-span-7 flex flex-col h-full min-h-[500px]">
          {generateMutation.isPending ? (
            <Card className="flex-1 bg-card border-card-border border-dashed flex flex-col items-center justify-center p-8 text-center animate-pulse">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <Sparkles size={32} className="text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Engenharia de Prompt em andamento</h3>
              <p className="text-muted-foreground max-w-md">
                Nossa IA está aplicando as melhores práticas de engenharia de prompt para estruturar sua solicitação perfeitamente...
              </p>
            </Card>
          ) : generateMutation.data ? (
            <Card className="flex-1 bg-card border-primary/50 shadow-[0_0_30px_rgba(225,29,72,0.1)] flex flex-col">
              <CardHeader className="border-b border-border/50 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <Badge className="mb-2 bg-primary/20 text-primary hover:bg-primary/20">Resultado Gerado</Badge>
                    <CardTitle className="text-2xl">{generateMutation.data.title}</CardTitle>
                  </div>
                </div>
                {generateMutation.data.suggestedTags && generateMutation.data.suggestedTags.length > 0 && (
                  <div className="flex gap-2 mt-4 flex-wrap">
                    {generateMutation.data.suggestedTags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-[10px] uppercase">#{tag}</Badge>
                    ))}
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-6 flex-1 bg-secondary/20 relative">
                <Textarea 
                  readOnly 
                  value={generateMutation.data.content} 
                  className="min-h-full h-[300px] font-mono text-sm resize-none bg-transparent border-0 focus-visible:ring-0 p-0"
                />
              </CardContent>
              <CardFooter className="p-4 border-t border-border/50 flex gap-3 justify-end bg-card">
                <Button variant="outline" onClick={handleSave} className="font-medium">
                  <Save size={16} className="mr-2" />
                  Salvar
                </Button>
                <Button onClick={handleCopy} className="font-medium">
                  {copied ? <CheckCircle2 size={16} className="mr-2" /> : <Copy size={16} className="mr-2" />}
                  {copied ? "Copiado!" : "Copiar Prompt"}
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card className="flex-1 bg-card border-card-border border-dashed flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <Sparkles size={48} className="mb-4 opacity-20" />
              <p>Preencha os dados ao lado para gerar um prompt otimizado.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

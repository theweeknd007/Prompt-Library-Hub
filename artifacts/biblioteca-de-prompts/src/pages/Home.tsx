import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Compass, Zap, Lock, Users, ChevronRight, CheckCircle2, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { PromptCard } from "@/components/PromptCard";
import { useListPopularPrompts } from "@workspace/api-client-react";

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user) {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  const { data: popularPrompts, isLoading } = useListPopularPrompts({ limit: 3 });

  return (
    <div className="flex flex-col min-h-[100dvh] bg-[#050505]">
      {/* Navbar */}
      <header className="px-6 py-4 border-b border-white/5 flex items-center justify-between sticky top-0 bg-[#0A0A0A]/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary/20 rounded border border-primary/50 text-primary flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 716 716" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M508.749 317.399C516.777 287.314 508.991 253.884 485.389 230.282C461.788 206.681 428.36 198.895 398.273 206.923C376.231 184.928 343.39 174.956 311.148 183.596C278.906 192.234 255.45 217.292 247.36 247.361C217.291 255.451 192.233 278.91 183.595 311.149C174.957 343.391 184.927 376.232 206.924 398.274C198.896 428.359 206.683 461.789 230.284 485.391C253.885 508.992 287.313 516.779 317.401 508.75C339.442 530.745 372.286 540.717 404.525 532.079C436.767 523.441 460.223 498.384 468.313 468.315C498.383 460.224 523.44 436.766 532.078 404.526C540.716 372.285 530.747 339.443 508.749 317.402V317.399ZM470.899 244.776C486.892 260.77 493.488 282.601 490.687 303.412L415.577 260.046C412.411 258.218 408.509 258.218 405.345 260.046L317.401 310.82V277.526C317.401 275.191 318.652 273.005 320.676 271.837L387.644 233.174C414.178 218.353 448.346 222.223 470.901 244.776H470.899ZM357.837 311.144L398.275 334.491V381.185L357.837 404.532L317.398 381.185V334.491L357.837 311.144ZM264.776 269.693C265.207 239.305 285.644 211.649 316.453 203.393C338.3 197.54 360.505 202.744 377.127 215.573L302.014 258.937C298.848 260.764 296.898 264.144 296.898 267.798V369.346L268.065 352.699C266.043 351.531 264.776 349.353 264.776 347.017V269.691V269.693ZM203.391 316.454C209.244 294.608 224.854 277.978 244.276 269.999V356.73C244.276 360.384 246.226 363.763 249.392 365.591L337.337 416.365L308.503 433.013C306.481 434.181 303.961 434.188 301.939 433.02L234.971 394.357C208.868 378.789 195.138 347.261 203.391 316.454ZM244.775 470.9C228.781 454.906 222.186 433.075 224.986 412.264L300.096 455.63C303.263 457.457 307.164 457.457 310.328 455.63L398.273 404.856V438.149C398.273 440.485 397.022 442.671 394.997 443.839L328.029 482.502C301.495 497.322 267.327 493.452 244.772 470.9H244.775ZM450.897 445.982C450.466 476.371 430.029 504.027 399.22 512.283C377.373 518.136 355.168 512.932 338.547 500.102L413.659 456.738C416.826 454.911 418.775 451.532 418.775 447.877V346.329L447.609 362.977C449.631 364.145 450.897 366.323 450.897 368.659V445.985V445.982ZM512.282 399.221C506.429 421.068 490.819 437.697 471.397 445.676V358.946C471.397 355.292 469.448 351.912 466.281 350.085L378.336 299.311L407.17 282.663C409.192 281.495 411.712 281.487 413.734 282.655L480.702 321.318C506.805 336.887 520.536 368.415 512.282 399.221Z"/>
            </svg>
          </div>
          <span className="font-bold text-lg tracking-tight hidden sm:inline-block">BIBLIOTECA <span className="text-primary">DE PROMPT</span></span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">Entrar</Link>
          <Link href="/register">
            <Button size="sm">Começar Grátis</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-24 pb-32 overflow-hidden flex flex-col items-center text-center px-4">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background -z-10" />
          
          <Badge variant="outline" className="mb-6 bg-primary/10 text-primary border-primary/20 py-1 px-4 text-sm">
            O arsenal definitivo para criadores
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold max-w-4xl tracking-tight leading-tight mb-8">
            Pare de digitar. <br/>
            Comece a <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-rose-400">produzir resultados.</span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mb-12">
            A Biblioteca de Prompts é uma plataforma premium onde criadores, marqueteiros e desenvolvedores encontram, gerenciam e refinam prompts de alta conversão.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto text-lg h-14 px-8 font-bold">
                Criar Conta Gratuita <ChevronRight className="ml-2" />
              </Button>
            </Link>
            <Link href="/explore">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg h-14 px-8 border-white/10 hover:bg-white/5">
                Explorar Biblioteca
              </Button>
            </Link>
          </div>
        </section>

        {/* Popular Prompts Preview */}
        <section className="py-24 bg-card/30 border-y border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-12">
              <div>
                <h2 className="text-3xl font-bold mb-4">Prompts que geram resultados</h2>
                <p className="text-muted-foreground">Testados e aprovados por milhares de profissionais.</p>
              </div>
              <Link href="/explore" className="hidden sm:flex items-center text-primary hover:underline font-medium">
                Ver todos <ArrowRight size={16} className="ml-1" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="h-64 bg-card rounded-lg border border-card-border animate-pulse" />
                ))
              ) : (
                popularPrompts?.map(prompt => (
                  <PromptCard key={prompt.id} prompt={prompt} />
                ))
              )}
            </div>
            
            <div className="mt-8 text-center sm:hidden">
              <Link href="/explore">
                <Button variant="outline" className="w-full">Ver todos os prompts</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Construído para profissionais de IA</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">Tudo que você precisa para dominar o ChatGPT, Claude e Midjourney em um só lugar.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-[#111] border-white/5 p-8 flex flex-col items-start hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/20 text-primary flex items-center justify-center mb-6">
                <Compass size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Biblioteca Curada</h3>
              <p className="text-muted-foreground">Acesse centenas de prompts premium organizados por categorias, casos de uso e taxa de sucesso.</p>
            </Card>
            
            <Card className="bg-[#111] border-white/5 p-8 flex flex-col items-start hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/20 text-primary flex items-center justify-center mb-6">
                <Lock size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Cofre Pessoal</h3>
              <p className="text-muted-foreground">Salve seus próprios prompts, organize com tags e mantenha-os privados ou compartilhe com a comunidade.</p>
            </Card>
            
            <Card className="bg-[#111] border-white/5 p-8 flex flex-col items-start hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-primary/20 text-primary flex items-center justify-center mb-6">
                <Zap size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Gerador com IA</h3>
              <p className="text-muted-foreground">Não sabe como começar? Nossa IA cria e refina o prompt perfeito baseado apenas no seu objetivo.</p>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Pronto para elevar seu nível?</h2>
            <p className="text-primary-foreground/80 text-xl mb-10 max-w-2xl mx-auto">
              Junte-se a milhares de profissionais que estão economizando horas todos os dias com os prompts certos.
            </p>
            <Link href="/register">
              <Button size="lg" variant="secondary" className="text-lg h-14 px-10 font-bold text-primary hover:bg-white">
                Criar Conta Agora
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-[#050505] border-t border-white/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <div className="text-primary">
              <svg width="24" height="24" viewBox="0 0 716 716" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M508.749 317.399C516.777 287.314 508.991 253.884 485.389 230.282C461.788 206.681 428.36 198.895 398.273 206.923C376.231 184.928 343.39 174.956 311.148 183.596C278.906 192.234 255.45 217.292 247.36 247.361C217.291 255.451 192.233 278.91 183.595 311.149C174.957 343.391 184.927 376.232 206.924 398.274C198.896 428.359 206.683 461.789 230.284 485.391C253.885 508.992 287.313 516.779 317.401 508.75C339.442 530.745 372.286 540.717 404.525 532.079C436.767 523.441 460.223 498.384 468.313 468.315C498.383 460.224 523.44 436.766 532.078 404.526C540.716 372.285 530.747 339.443 508.749 317.402V317.399ZM470.899 244.776C486.892 260.77 493.488 282.601 490.687 303.412L415.577 260.046C412.411 258.218 408.509 258.218 405.345 260.046L317.401 310.82V277.526C317.401 275.191 318.652 273.005 320.676 271.837L387.644 233.174C414.178 218.353 448.346 222.223 470.901 244.776H470.899ZM357.837 311.144L398.275 334.491V381.185L357.837 404.532L317.398 381.185V334.491L357.837 311.144ZM264.776 269.693C265.207 239.305 285.644 211.649 316.453 203.393C338.3 197.54 360.505 202.744 377.127 215.573L302.014 258.937C298.848 260.764 296.898 264.144 296.898 267.798V369.346L268.065 352.699C266.043 351.531 264.776 349.353 264.776 347.017V269.691V269.693ZM203.391 316.454C209.244 294.608 224.854 277.978 244.276 269.999V356.73C244.276 360.384 246.226 363.763 249.392 365.591L337.337 416.365L308.503 433.013C306.481 434.181 303.961 434.188 301.939 433.02L234.971 394.357C208.868 378.789 195.138 347.261 203.391 316.454ZM244.775 470.9C228.781 454.906 222.186 433.075 224.986 412.264L300.096 455.63C303.263 457.457 307.164 457.457 310.328 455.63L398.273 404.856V438.149C398.273 440.485 397.022 442.671 394.997 443.839L328.029 482.502C301.495 497.322 267.327 493.452 244.772 470.9H244.775ZM450.897 445.982C450.466 476.371 430.029 504.027 399.22 512.283C377.373 518.136 355.168 512.932 338.547 500.102L413.659 456.738C416.826 454.911 418.775 451.532 418.775 447.877V346.329L447.609 362.977C449.631 364.145 450.897 366.323 450.897 368.659V445.985V445.982ZM512.282 399.221C506.429 421.068 490.819 437.697 471.397 445.676V358.946C471.397 355.292 469.448 351.912 466.281 350.085L378.336 299.311L407.17 282.663C409.192 281.495 411.712 281.487 413.734 282.655L480.702 321.318C506.805 336.887 520.536 368.415 512.282 399.221Z"/>
              </svg>
            </div>
            <span className="font-bold">Biblioteca de Prompt &copy; 2024</span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/explore" className="hover:text-white">Explorar</Link>
            <Link href="/plans" className="hover:text-white">Planos</Link>
            <a href="#" className="hover:text-white">Termos</a>
            <a href="#" className="hover:text-white">Privacidade</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

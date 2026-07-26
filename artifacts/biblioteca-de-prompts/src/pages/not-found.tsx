import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4 bg-background">
      <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-2">Página não encontrada</h2>
      <p className="text-muted-foreground mb-8 max-w-md">
        O link que você acessou pode estar quebrado, ou a página pode ter sido removida.
      </p>
      <Link href="/">
        <Button size="lg" className="font-bold">Voltar para o Início</Button>
      </Link>
    </div>
  );
}

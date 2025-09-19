import Link from "next/link";
import { Wallet2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto max-w-5xl h-14 px-4 flex items-center justify-between">
        {/* Marca */}
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Wallet2 className="h-5 w-5" />
          <span>MiBolsillo</span>
        </Link>

        {/* Navegación (links de ejemplo por ahora) */}
        <nav className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/">Inicio</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/movimientos">Movimientos</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}

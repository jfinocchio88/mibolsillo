import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <section className="min-h-[50vh] grid place-items-center text-center">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">💰 MiBolsillo</h1>
        <p className="text-muted-foreground">
          Tu dinero, claro y simple. Empezá cargando tus movimientos.
        </p>
        <div className="flex gap-2 justify-center">
          <Button asChild>
            <Link href="/movimientos">Ir a Movimientos</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">Dashboard</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

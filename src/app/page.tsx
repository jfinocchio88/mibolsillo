"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Tipo = "INGRESO" | "EGRESO";

type Movimiento = {
  id: string;
  tipo: Tipo;
  descripcion: string;
  monto: number; // positivo
  fecha: Date;
};

export default function Home() {
  const [tipo, setTipo] = useState<Tipo>("EGRESO");
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState<string>("");

  // Lista en memoria para esta demo (todavía sin base de datos)
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);

  const formatoARS = useMemo(
    () =>
      new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 2,
      }),
    []
  );

  const totalIngreso = movimientos
    .filter((m) => m.tipo === "INGRESO")
    .reduce((acc, m) => acc + m.monto, 0);

  const totalEgreso = movimientos
    .filter((m) => m.tipo === "EGRESO")
    .reduce((acc, m) => acc + m.monto, 0);

  const neto = totalIngreso - totalEgreso;

  function onAgregar(e: React.FormEvent) {
    e.preventDefault();

    const montoNumero = Number(
      monto.replace(".", "").replace(",", ".").trim()
    );

    // Validaciones simples
    if (!descripcion.trim()) {
      alert("Falta la descripción");
      return;
    }
    if (isNaN(montoNumero) || montoNumero <= 0) {
      alert("Montó inválido. Usá números (ej: 2500 o 2.500,50).");
      return;
    }

    const nuevo: Movimiento = {
      id: crypto.randomUUID(),
      tipo,
      descripcion: descripcion.trim(),
      monto: montoNumero,
      fecha: new Date(),
    };

    setMovimientos((prev) => [nuevo, ...prev]);
    // Limpiar formulario
    setDescripcion("");
    setMonto("");
    setTipo("EGRESO");
  }

  return (
    <main className="min-h-dvh p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">💰 MiBolsillo</h1>
      <p className="text-muted-foreground">
        Cargá un movimiento para ir probando el flujo (solo visible en tu
        pantalla por ahora).
      </p>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-base">Ingresos</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {formatoARS.format(totalIngreso)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-base">Egresos</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {formatoARS.format(totalEgreso)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-base">Neto</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {formatoARS.format(neto)}
          </CardContent>
        </Card>
      </div>

      {/* Formulario */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Agregar movimiento</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onAgregar} className="grid gap-4 md:grid-cols-4">
            <div className="md:col-span-1">
              <Label className="mb-1 block">Tipo</Label>
              <Select value={tipo} onValueChange={(v: Tipo) => setTipo(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Elegí tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EGRESO">Egreso</SelectItem>
                  <SelectItem value="INGRESO">Ingreso</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label className="mb-1 block">Descripción</Label>
              <Input
                placeholder="Ej: Super chino, Sueldo, Farmacia…"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
              />
            </div>

            <div className="md:col-span-1">
              <Label className="mb-1 block">Monto (ARS)</Label>
              <Input
                inputMode="decimal"
                placeholder="Ej: 2500,50"
                value={monto}
                onChange={(e) => setMonto(e.target.value)}
              />
            </div>

            <div className="md:col-span-4">
              <Button type="submit" className="w-full md:w-auto">
                Agregar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Lista simple */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Últimos movimientos</CardTitle>
        </CardHeader>
        <CardContent>
          {movimientos.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Todavía no cargaste movimientos.
            </p>
          ) : (
            <div className="space-y-2">
              {movimientos.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <div className="font-medium">
                      {m.tipo === "EGRESO" ? "− " : "+ "}
                      {formatoARS.format(m.monto)} • {m.descripcion}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {m.fecha.toLocaleString("es-AR")}
                    </div>
                  </div>
                  <span
                    className={`text-xs rounded px-2 py-1 ${
                      m.tipo === "EGRESO"
                        ? "bg-red-100 text-red-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {m.tipo}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

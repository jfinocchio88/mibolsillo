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
import {
  useMovStore,
  Tipo,
  CATEGORIAS_EGRESO,
  CATEGORIAS_INGRESO,
} from "@/store/movimientos";

export default function MovimientosPage() {
  const [tipo, setTipo] = useState<Tipo>("EGRESO");
  const [categoria, setCategoria] = useState<string>("");
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState<string>("");
  const [nota, setNota] = useState<string>("");

  const movimientos = useMovStore((s) => s.movimientos);
  const add = useMovStore((s) => s.add);

  const categorias = tipo === "EGRESO" ? CATEGORIAS_EGRESO : CATEGORIAS_INGRESO;

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

    const montoNumero = Number(monto.replace(/\./g, "").replace(",", "."));

    if (!categoria) return alert("Elegí una categoría");
    if (!descripcion.trim()) return alert("Falta la descripción");
    if (!monto || isNaN(montoNumero) || montoNumero <= 0)
      return alert("Monto inválido. Ej: 2500 o 2.500,50");

    add({ tipo, categoria, descripcion, nota: nota.trim() || undefined, monto: montoNumero });

    // limpiar
    setDescripcion("");
    setMonto("");
    setNota("");
    setCategoria("");
    setTipo("EGRESO");
  }

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Movimientos</h1>
      <p className="text-muted-foreground">
        Cargá ingresos y egresos (con categoría y nota). Se comparten con el Dashboard y
        quedan guardados en tu navegador.
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
          <form onSubmit={onAgregar} className="grid gap-4 md:grid-cols-6">
            <div className="md:col-span-1">
              <Label className="mb-1 block">Tipo</Label>
              <Select
                value={tipo}
                onValueChange={(v: Tipo) => {
                  setTipo(v);
                  setCategoria(""); // reiniciar categoría al cambiar tipo
                }}
              >
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
              <Label className="mb-1 block">Categoría</Label>
              <Select value={categoria} onValueChange={(v) => setCategoria(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Elegí categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categorias.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label className="mb-1 block">Descripción</Label>
              <Input
                placeholder="Ej: Super chino / Sueldo / Farmacia…"
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

            <div className="md:col-span-6">
              <Label className="mb-1 block">Nota (opcional)</Label>
              <Input
                placeholder="Detalle / referencia (opcional)"
                value={nota}
                onChange={(e) => setNota(e.target.value)}
              />
            </div>

            <div className="md:col-span-6">
              <Button type="submit" className="w-full md:w-auto">
                Agregar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Lista */}
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
                      {" "}
                      <span className="text-xs text-muted-foreground">
                        [{m.categoria ?? "Sin categoría"}]
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(m.fecha).toLocaleString("es-AR")}
                      {m.nota ? ` • ${m.nota}` : ""}
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
    </section>
  );
}

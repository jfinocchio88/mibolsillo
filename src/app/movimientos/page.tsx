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

/** Sentinel para el filtro de categoría "Todas" (evita SelectItem con value="") */
const ALL_CATS = "__ALL__";

/* Helpers */
function diasDiff(aISO: string, b: Date) {
  const a = new Date(aISO);
  const diff = Math.abs(+b - +a);
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

export default function MovimientosPage() {
  /* ---------- Estado del formulario ---------- */
  const [tipo, setTipo] = useState<Tipo>("EGRESO");
  const [categoria, setCategoria] = useState<string>("");
  const [descripcion, setDescripcion] = useState("");
  const [monto, setMonto] = useState<string>("");
  const [nota, setNota] = useState<string>("");

  /* ---------- Estado de filtros ---------- */
  type FTipo = "TODOS" | "INGRESO" | "EGRESO";
  type FRango = "todos" | "7" | "30";

  const [fTipo, setFTipo] = useState<FTipo>("TODOS");
  const [fCategoria, setFCategoria] = useState<string>(""); // "" = Todas
  const [fTexto, setFTexto] = useState<string>("");
  const [fRango, setFRango] = useState<FRango>("todos");

  /* ---------- Store ---------- */
  const movimientos = useMovStore((s) => s.movimientos);
  const add = useMovStore((s) => s.add);
  const clearAll = useMovStore((s) => s.clearAll);

  /* ---------- Categorías disponibles ---------- */
  const categoriasDisponibles = useMemo(() => {
    const fromData = Array.from(
      new Set(movimientos.map((m) => m.categoria).filter(Boolean) as string[])
    );
    const base = tipo === "EGRESO" ? CATEGORIAS_EGRESO : CATEGORIAS_INGRESO;
    return Array.from(new Set([...fromData, ...base]));
  }, [movimientos, tipo]);

  /* ---------- Formato moneda ---------- */
  const formatoARS = useMemo(
    () =>
      new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        minimumFractionDigits: 2,
      }),
    []
  );

  /* ---------- KPIs (no filtrados) ---------- */
  const totalIngreso = movimientos
    .filter((m) => m.tipo === "INGRESO")
    .reduce((acc, m) => acc + m.monto, 0);

  const totalEgreso = movimientos
    .filter((m) => m.tipo === "EGRESO")
    .reduce((acc, m) => acc + m.monto, 0);

  const neto = totalIngreso - totalEgreso;

  /* ---------- Filtrado ---------- */
  const hoy = new Date();
  const movFiltrados = useMemo(() => {
    const q = fTexto.trim().toLowerCase();
    return movimientos.filter((m) => {
      if (fTipo !== "TODOS" && m.tipo !== fTipo) return false;
      if (fCategoria && (m.categoria || "") !== fCategoria) return false;
      if (q) {
        const texto = `${m.descripcion} ${m.nota ?? ""}`.toLowerCase();
        if (!texto.includes(q)) return false;
      }
      if (fRango !== "todos") {
        const limite = Number(fRango); // 7 o 30
        if (diasDiff(m.fecha, hoy) > limite) return false;
      }
      return true;
    });
  }, [movimientos, fTipo, fCategoria, fTexto, fRango]);

  /* ---------- Submit ---------- */
  function onAgregar(e: React.FormEvent) {
    e.preventDefault();
    const montoNumero = Number(monto.replace(/\./g, "").replace(",", "."));
    if (!categoria) return alert("Elegí una categoría");
    if (!descripcion.trim()) return alert("Falta la descripción");
    if (!monto || isNaN(montoNumero) || montoNumero <= 0)
      return alert("Monto inválido. Ej: 2500 o 2.500,50");

    add({
      tipo,
      categoria,
      descripcion,
      nota: nota.trim() || undefined,
      monto: montoNumero,
    });

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

      {/* Filtros */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-6">
          {/* Tipo */}
          <div className="md:col-span-1">
            <Label className="mb-1 block">Tipo</Label>
            <Select value={fTipo} onValueChange={(v: FTipo) => setFTipo(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos</SelectItem>
                <SelectItem value="EGRESO">Egreso</SelectItem>
                <SelectItem value="INGRESO">Ingreso</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Categoría (usa sentinel para "Todas") */}
          <div className="md:col-span-2">
            <Label className="mb-1 block">Categoría</Label>
            <Select
              value={fCategoria || ALL_CATS}
              onValueChange={(v) => setFCategoria(v === ALL_CATS ? "" : v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_CATS}>Todas</SelectItem>
                {Array.from(new Set(categoriasDisponibles)).map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Texto */}
          <div className="md:col-span-2">
            <Label className="mb-1 block">Buscar (descripción/nota)</Label>
            <Input
              placeholder="Ej: sueldo, super, farmacia…"
              value={fTexto}
              onChange={(e) => setFTexto(e.target.value)}
            />
          </div>

          {/* Rango */}
          <div className="md:col-span-1">
            <Label className="mb-1 block">Rango</Label>
            <Select value={fRango} onValueChange={(v: FRango) => setFRango(v)}>
              <SelectTrigger>
                <SelectValue placeholder="Rango" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="7">Últimos 7 días</SelectItem>
                <SelectItem value="30">Últimos 30 días</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Botones */}
          <div className="md:col-span-6 flex gap-2 pt-1">
            <Button
              variant="outline"
              onClick={() => {
                setFTipo("TODOS");
                setFCategoria("");
                setFTexto("");
                setFRango("todos");
              }}
            >
              Limpiar filtros
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirm("¿Borrar TODOS los movimientos?")) clearAll();
              }}
            >
              Borrar todo
            </Button>
            <div className="ml-auto text-sm text-muted-foreground self-center">
              {movFiltrados.length} movimiento(s) mostrados
            </div>
          </div>
        </CardContent>
      </Card>

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
                  setCategoria(""); // reset al cambiar tipo
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
              <Select
                value={categoria || undefined /* evita value="" en controlado */}
                onValueChange={(v) => setCategoria(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Elegí categoría" />
                </SelectTrigger>
                <SelectContent>
                  {(tipo === "EGRESO" ? CATEGORIAS_EGRESO : CATEGORIAS_INGRESO).map((c) => (
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

      {/* Lista filtrada */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Resultados</CardTitle>
        </CardHeader>
        <CardContent>
          {movFiltrados.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No hay movimientos con los filtros actuales.
            </p>
          ) : (
            <div className="space-y-2">
              {movFiltrados.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <div className="font-medium">
                      {m.tipo === "EGRESO" ? "− " : "+ "}
                      {formatoARS.format(m.monto)} • {m.descripcion}{" "}
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

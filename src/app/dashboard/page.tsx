"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { useMovStore } from "@/store/movimientos";

const dias = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"] as const;

function ultimo7Dias() {
  const hoy = new Date();
  const arr: { label: string; dateOnly: string }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(hoy);
    d.setDate(hoy.getDate() - i);
    const label = dias[d.getDay()];
    const dateOnly = d.toISOString().slice(0, 10); // YYYY-MM-DD
    arr.push({ label, dateOnly });
  }
  return arr;
}

export default function DashboardPage() {
  const movimientos = useMovStore((s) => s.movimientos);

  // Totales
  const totalIngreso = movimientos
    .filter((m) => m.tipo === "INGRESO")
    .reduce((a, m) => a + m.monto, 0);
  const totalEgreso = movimientos
    .filter((m) => m.tipo === "EGRESO")
    .reduce((a, m) => a + m.monto, 0);
  const neto = totalIngreso - totalEgreso;

  // Serie últimos 7 días
  const base = ultimo7Dias();
  const data = base.map(({ label, dateOnly }) => {
    const delDia = movimientos.filter((m) => m.fecha.slice(0, 10) === dateOnly);
    const ingreso = delDia
      .filter((m) => m.tipo === "INGRESO")
      .reduce((a, m) => a + m.monto, 0);
    const egreso = delDia
      .filter((m) => m.tipo === "EGRESO")
      .reduce((a, m) => a + m.monto, 0);
    return { dia: label, ingreso, egreso };
  });

  // Formateador de moneda (compacto para el eje)
  const fmt = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    notation: "compact",
    maximumFractionDigits: 1,
  });

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">
        Los datos se actualizan con lo que cargás en <strong>Movimientos</strong>.
      </p>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-base">Ingresos (total)</CardTitle>
          </CardHeader>
        <CardContent className="text-2xl font-semibold">
            {totalIngreso.toLocaleString("es-AR")}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-base">Egresos (total)</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {totalEgreso.toLocaleString("es-AR")}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-base">Neto</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {neto.toLocaleString("es-AR")}
          </CardContent>
        </Card>
      </div>

      {/* Gráfico últimos 7 días */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Ingresos vs Egresos (últimos 7 días)</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Altura fija para que Recharts renderice */}
          <div style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dia" />
                <YAxis tickFormatter={(v) => fmt.format(Number(v))} domain={[0, "auto"]} />
                <Tooltip
                  formatter={(value, name) => [
                    new Intl.NumberFormat("es-AR", {
                      style: "currency",
                      currency: "ARS",
                    }).format(Number(value)),
                    name === "ingreso" ? "Ingreso" : "Egreso",
                  ]}
                  labelFormatter={(label) => `Día: ${label}`}
                />
                <Legend />
                {/* Colores distintos */}
                <Line
                  type="monotone"
                  dataKey="ingreso"
                  name="Ingreso"
                  stroke="#22c55e" // verde (Tailwind emerald-500)
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="egreso"
                  name="Egreso"
                  stroke="#ef4444" // rojo (Tailwind red-500)
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

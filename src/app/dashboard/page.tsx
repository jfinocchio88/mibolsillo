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
} from "recharts";

const data = [
  { dia: "Lun", ingreso: 120000, egreso: 45000 },
  { dia: "Mar", ingreso: 80000, egreso: 30000 },
  { dia: "Mié", ingreso: 60000, egreso: 40000 },
  { dia: "Jue", ingreso: 90000, egreso: 35000 },
  { dia: "Vie", ingreso: 50000, egreso: 25000 },
  { dia: "Sáb", ingreso: 70000, egreso: 20000 },
  { dia: "Dom", ingreso: 40000, egreso: 15000 },
];

const totalIngreso = data.reduce((a, d) => a + d.ingreso, 0);
const totalEgreso  = data.reduce((a, d) => a + d.egreso, 0);
const neto         = totalIngreso - totalEgreso;

export default function DashboardPage() {
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">
        Vista general semanal (datos de ejemplo). Próximamente lo conectamos a tus movimientos reales.
      </p>

      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-base">Ingresos (semana)</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {totalIngreso.toLocaleString("es-AR")}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-base">Egresos (semana)</CardTitle>
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

      {/* Gráfico */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Ingresos vs Egresos (7 días)</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dia" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="ingreso" strokeWidth={2} />
              <Line type="monotone" dataKey="egreso" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </section>
  );
}

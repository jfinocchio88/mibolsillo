"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type Tipo = "INGRESO" | "EGRESO";

/** Listas simples para el selector de categorías */
export const CATEGORIAS_EGRESO = [
  "Alimentos",
  "Transporte",
  "Vivienda",
  "Servicios",
  "Salud",
  "Educación",
  "Ocio",
  "Otros",
] as const;

export const CATEGORIAS_INGRESO = [
  "Sueldo",
  "Ventas",
  "Inversiones",
  "Devoluciones",
  "Otros",
] as const;

export type Movimiento = {
  id: string;
  tipo: Tipo;
  categoria?: string;  // NUEVO
  descripcion: string;
  nota?: string;       // NUEVO
  monto: number;       // positivo
  fecha: string;       // ISO
};

type State = {
  movimientos: Movimiento[];
  add: (m: {
    tipo: Tipo;
    descripcion: string;
    monto: number;
    categoria?: string;
    nota?: string;
  }) => void;
  clearAll: () => void;
};

export const useMovStore = create<State>()(
  persist(
    (set) => ({
      movimientos: [],
      add: ({ tipo, descripcion, monto, categoria, nota }) =>
        set((s) => ({
          movimientos: [
            {
              id: crypto.randomUUID(),
              tipo,
              categoria,
              descripcion: descripcion.trim(),
              nota,
              monto,
              fecha: new Date().toISOString(),
            },
            ...s.movimientos,
          ],
        })),
      clearAll: () => set({ movimientos: [] }),
    }),
    {
      name: "mibolsillo-movimientos",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ movimientos: s.movimientos }),
    }
  )
);

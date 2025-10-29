"use server";

import { Gasto } from "@/interfaces";
import { adminDB } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";

interface GastoInput {
  status?: string;
  amount: number;
  distribution: {
    ministeryId: string;
    percent: number;
    approvedByDirector: boolean;
  }[];
}

export async function createEventoGasto(
  gastosInput: GastoInput[], // ← es un array, no un objeto con .gastos
  status?: string
) {
  try {
    const now = Timestamp.now();

    // Aseguramos que cada gasto tenga un status
    const gastos = gastosInput.map((gasto) => ({
      ...gasto,
      status: gasto.status ?? "pendiente",
      createdAt: now,
    }));

    const eventoGasto = {
      createdAt: now.toDate(), // <-- aquí
      modified: now.toDate(),
      status: status ?? "pendiente",
      gastos: gastos.map((g) => ({
        ...g,
        createdAt: now.toDate(),
        status: g.status ?? "pendiente",
      })),
    };

    // Guardamos en Firestore
    const ref = await adminDB.collection("eventos_gastos").add(eventoGasto);

    // Devolvemos un objeto limpio
    return {
      success: true,
      id: ref.id,
      data: eventoGasto,
    };
  } catch (error: any) {
    console.error("Error creando evento de gasto:", error);
    return { success: false, error: error.message };
  }
}

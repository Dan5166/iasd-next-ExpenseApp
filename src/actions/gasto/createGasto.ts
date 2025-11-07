"use server";

import { adminDB } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";

interface GastoInput {
  amount: number;
  status?: string;
  description?: string;
  eventId?: string | null;
  userId?: string;
  distribution: {
    ministeryId: string;
    percent: number;
    approvedByDirector: boolean;
  }[];
  receiptUrl?: string;
}

export interface GastoData {
  eventId: string | null;
  description: string;
  amount: number;
  createdAt: string; // ISO
  modifiedAt: string; // ISO
  userId: string;
  status: string;
  distribution: {
    ministeryId: string;
    percent: number;
    approvedByDirector: boolean;
  }[];
  receiptUrl: string | null;
}

export type ActionResult<T> =
  | { success: true; id?: string; data?: T }
  | { success: false; error: string };

export async function createGasto(
  gastoInput: GastoInput
): Promise<ActionResult<GastoData>> {
  try {
    const now = Timestamp.now();

    const gasto = {
      eventId: gastoInput.eventId || null,
      description: gastoInput.description || "",
      amount: gastoInput.amount,
      createdAt: now,
      modifiedAt: now,
      userId: gastoInput.userId || "",
      status: gastoInput.status || "draft",
      distribution: gastoInput.distribution,
      receiptUrl: gastoInput.receiptUrl || null,
    };

    const ref = await adminDB.collection("gastos").add(gasto);

    // ⚙️ Versión serializable
    const plainData: GastoData = {
      ...gasto,
      createdAt: now.toDate().toISOString(),
      modifiedAt: now.toDate().toISOString(),
    };

    return {
      success: true,
      id: ref.id,
      data: plainData,
    };
  } catch (error) {
    console.error("Error creando gasto:", error);

    const message =
      error instanceof Error ? error.message : "Error desconocido";

    return { success: false, error: message };
  }
}

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

export async function createGasto(gastoInput: GastoInput) {
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

    // ⚠️ Conversión segura antes de devolver al cliente
    const plainData = {
      ...gasto,
      createdAt: now.toDate().toISOString(),
      modifiedAt: now.toDate().toISOString(),
    };

    return {
      success: true,
      id: ref.id,
      data: plainData, // ✅ serializable
    };
  } catch (error: any) {
    console.error("Error creando gasto:", error);
    return { success: false, error: error.message };
  }
}

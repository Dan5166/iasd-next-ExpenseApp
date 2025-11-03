"use server";

import { adminDB } from "@/lib/firebaseAdmin";

export async function fetchUnassignedGastos() {
  try {
    const snapshot = await adminDB
      .collection("gastos")
      .where("eventId", "==", null)
      .get();

    const gastos = snapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        amount: data.amount ?? 0,
        description: data.description ?? "",
        status: data.status ?? "draft", // ✅ agregado
        eventId: data.eventId ?? null, // ✅ agregado
        createdAt: data.createdAt
          ? data.createdAt.toDate().toISOString()
          : null,
        modifiedAt: data.modifiedAt
          ? data.modifiedAt.toDate().toISOString()
          : null,
      };
    });

    return { success: true, data: gastos };
  } catch (error: any) {
    console.error("Error obteniendo gastos:", error);
    return { success: false, data: [], error: error.message };
  }
}

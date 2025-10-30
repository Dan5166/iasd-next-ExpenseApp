"use server";

import { adminDB } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";

export async function fetchEventos() {
  try {
    const eventosSnapshot = await adminDB.collection("eventos_gastos").get();

    const eventos = eventosSnapshot.docs.map((doc) => {
      const data = doc.data();

      // Serializamos los Timestamps
      const serializeTimestamp = (ts: any) =>
        ts instanceof Timestamp ? ts.toDate().toISOString() : ts;

      return {
        id: doc.id,
        eventName: data.eventName,
        createdAt: serializeTimestamp(data.createdAt),
        modified: serializeTimestamp(data.modified),
        status: data.status,
        gastos: data.gastos,
      };
    });

    return { success: true, data: eventos };
  } catch (error: any) {
    console.error("Error obteniendo eventos de gasto:", error);
    return { success: false, error: error.message };
  }
}

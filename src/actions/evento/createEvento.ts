"use server";

import { adminDB } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";

interface CreateEventoInput {
  nombre: string;
  fecha: string; // formato ISO (ej. "2025-11-02")
  gastoIds: string[];
}

export async function createEvento({
  nombre,
  fecha,
  gastoIds,
}: CreateEventoInput) {
  const batch = adminDB.batch();

  try {
    const eventoRef = adminDB.collection("eventos").doc();
    const now = Timestamp.now();

    const eventoData = {
      nombre,
      fecha: new Date(fecha),
      createdAt: now,
      updatedAt: now,
      gastoIds,
    };

    batch.set(eventoRef, eventoData);

    // Actualizar cada gasto seleccionado para asignarlo al evento
    gastoIds.forEach((id) => {
      const gastoRef = adminDB.collection("gastos").doc(id);
      batch.update(gastoRef, {
        eventId: eventoRef.id,
        modifiedAt: now,
      });
    });

    await batch.commit();

    return { success: true, id: eventoRef.id };
  } catch (error: any) {
    console.error("Error creando evento:", error);
    return { success: false, error: error.message };
  }
}

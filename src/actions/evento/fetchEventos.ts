"use server";

import { adminDB } from "@/lib/firebaseAdmin";

export async function fetchEventos() {
  try {
    const snapshot = await adminDB.collection("eventos").get();

    const eventos = snapshot.docs.map((doc) => {
      const data = doc.data();

      return {
        id: doc.id,
        nombre: data.nombre ?? "",
        gastoIds: data.gastoIds ?? [],
        fecha: data.fecha ? data.fecha.toDate().toISOString() : null,
        createdAt: data.createdAt
          ? data.createdAt.toDate().toISOString()
          : null,
        updatedAt: data.updatedAt
          ? data.updatedAt.toDate().toISOString()
          : null,
      };
    });

    return { success: true, data: eventos };
  } catch (error) {
    console.error("Error obteniendo eventos:", error);

    let message = "Error desconocido";

    if (error instanceof Error) {
      message = error.message;
    }

    return { success: false, data: [], error: message };
  }
}

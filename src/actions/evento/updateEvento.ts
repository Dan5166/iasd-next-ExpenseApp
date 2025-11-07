"use server";

import { adminDB } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";

// 🔹 Define un tipo para el estado del formulario
interface EventoFormState {
  success: boolean;
  error?: string;
}

export async function updateEvento(
  prevState: EventoFormState,
  formData: FormData
): Promise<EventoFormState> {
  const id = formData.get("id") as string;
  const nombre = formData.get("nombre") as string;
  const fecha = formData.get("fecha") as string;

  try {
    const eventoRef = adminDB.collection("eventos").doc(id);

    await eventoRef.update({
      nombre,
      fecha: new Date(fecha),
      updatedAt: Timestamp.now(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error actualizando evento:", error);
    return { success: false, error: "Error actualizando evento" };
  }
}

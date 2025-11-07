"use server";

import { adminStorage } from "@/lib/firebaseAdmin";
import { v4 as uuidv4 } from "uuid";

/**
 * Sube una boleta (PDF o imagen) al Storage de Firebase
 * y devuelve un signed URL temporal para poder verla desde el front-end.
 */
export async function uploadBoleta(file: File) {
  try {
    const bucket = adminStorage.bucket(); // adminStorage ya es tu Bucket
    const destination = `boletas/${uuidv4()}-${file.name}`;
    const fileRef = bucket.file(destination);

    const buffer = Buffer.from(await file.arrayBuffer());

    await fileRef.save(buffer, {
      contentType: file.type,
      metadata: {
        firebaseStorageDownloadTokens: uuidv4(), // opcional si quieres token
      },
    });

    // Generar signed URL que expira en 1 hora
    // 7 días * 24 horas/día * 60 minutos/hora * 60 segundos/minuto * 1000 milisegundos/segundo
    const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
    const expiresAt = Date.now() + ONE_WEEK_MS;
    const [signedUrl] = await fileRef.getSignedUrl({
      action: "read",
      expires: new Date(expiresAt),
    });

    return { success: true, url: signedUrl };
  } catch (error) {
    console.error("Error subiendo boleta:", error);
    return { success: false, error: "Error subiendo boleta" };
  }
}

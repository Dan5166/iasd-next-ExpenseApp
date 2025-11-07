"use client";

import { updateEvento } from "@/actions/evento/updateEvento";
import { useActionState } from "react";

interface Evento {
  id: string;
  nombre: string;
  fecha: string;
  gastoIds: string[];
}

const initialState = { success: false, error: undefined };

export default function EditarEventoForm({ evento }: { evento: Evento }) {
  const [state, formAction] = useActionState(updateEvento, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="id" value={evento.id} />

      <label className="flex flex-col">
        <span className="text-sm text-gray-700">Nombre</span>
        <input
          name="nombre"
          defaultValue={evento.nombre}
          className="border rounded p-2"
        />
      </label>

      <label className="flex flex-col">
        <span className="text-sm text-gray-700">Fecha</span>
        <input
          name="fecha"
          type="date"
          defaultValue={evento.fecha.split("T")[0]} // <- asegura formato correcto
          className="border rounded p-2"
        />
      </label>

      <button
        type="submit"
        className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
      >
        Actualizar
      </button>

      {state?.error && (
        <p className="text-red-500 text-sm mt-1">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-green-600 text-sm mt-1">
          ✅ Evento actualizado correctamente
        </p>
      )}
    </form>
  );
}

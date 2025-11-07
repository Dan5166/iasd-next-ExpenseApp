"use client";

import { useState, useEffect } from "react";
import {
  createEvento,
  CreateEventoResult,
} from "@/actions/evento/createEvento";
import { fetchUnassignedGastos } from "@/actions/gasto/fetchUnassignedGastos";

interface Gasto {
  id: string;
  amount: number;
  description?: string;
  createdAt?: string;
}

export default function NewEventoPage() {
  const [nombre, setNombre] = useState("");
  const [fecha, setFecha] = useState("");
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CreateEventoResult>();

  // Cargar gastos sin asignar
  useEffect(() => {
    (async () => {
      const res = await fetchUnassignedGastos();
      if (res.success) setGastos(res.data ?? []);
      else alert("Error cargando gastos: " + res.error);
    })();
  }, []);

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !fecha) return alert("Falta nombre o fecha del evento");
    if (selected.length === 0) return alert("Selecciona al menos un gasto");

    setLoading(true);
    const res = await createEvento({ nombre, fecha, gastoIds: selected });
    setResult(res);
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      <h1 className="text-2xl font-semibold">Nuevo evento</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Nombre del evento</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="border rounded-md p-2 w-full"
            placeholder="Ej: Campamento de verano"
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Fecha</label>
          <input
            type="date"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="border rounded-md p-2 w-full"
          />
        </div>

        <div>
          <h2 className="font-semibold mb-2">Seleccionar gastos</h2>
          {gastos.length === 0 ? (
            <p className="text-sm text-gray-500">No hay gastos disponibles</p>
          ) : (
            <ul className="rounded-md divide-y">
              {gastos.map((g) => (
                <li
                  key={g.id}
                  onClick={() => toggleSelect(g.id)}
                  className={`bg-gray-50 border-1 p-3 cursor-pointer flex justify-between rounded-md ${
                    selected.includes(g.id)
                      ? "bg-indigo-100 border-l-4 border-indigo-600"
                      : "hover:bg-gray-50 border-gray-600"
                  }`}
                >
                  <div>
                    <p className="font-medium">
                      {g.amount.toLocaleString("es-CL", {
                        style: "currency",
                        currency: "CLP",
                      })}
                    </p>
                    <p className="text-xs text-gray-500">
                      {g.description || "Sin descripción"}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={selected.includes(g.id)}
                    readOnly
                    className="accent-indigo-600"
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md w-full"
        >
          {loading ? "Creando evento..." : "Crear evento"}
        </button>

        {result && (
          <pre className="bg-gray-50 p-2 rounded text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </form>
    </div>
  );
}

"use client";

import { useState } from "react";
import { createEventoGasto } from "@/actions";
import { Gasto } from "@/interfaces";

interface DistributionInput {
  ministeryId: string;
  percent: number;
  approvedByDirector: boolean;
}

export default function NuevoEventoGastoForm() {
  const [amount, setAmount] = useState("");
  const [distributions, setDistributions] = useState<DistributionInput[]>([]);
  const [ministeryId, setMinisteryId] = useState("");
  const [percent, setPercent] = useState("");
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // ➕ Agregar distribución
  const handleAddDistribution = () => {
    if (!ministeryId || !percent) return;

    setDistributions((prev) => [
      ...prev,
      {
        ministeryId,
        percent: Number(percent),
        approvedByDirector: false,
      },
    ]);

    setMinisteryId("");
    setPercent("");
  };

  // 🗑️ Eliminar distribución
  const handleRemoveDistribution = (index: number) => {
    setDistributions((prev) => prev.filter((_, i) => i !== index));
  };

  // ➕ Agregar gasto completo
  const handleAddGasto = () => {
    if (!amount || distributions.length === 0) return;

    const newGasto: Gasto = {
      status: "draft",
      amount: Number(amount),
      distribution: distributions,
    };

    setGastos((prev) => [...prev, newGasto]);
    setAmount("");
    setDistributions([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (gastos.length === 0) return alert("Agrega al menos un gasto");

    setLoading(true);

    const res = await createEventoGasto(gastos, "draft");

    setResult(res);
    setGastos([]);
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
      {/* Monto del gasto */}
      <div>
        <label className="block mb-1 font-medium">Monto del gasto</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border rounded-md w-full p-2"
        />
      </div>

      {/* Distribuciones */}
      <div className="border rounded-md p-3">
        <h3 className="font-semibold mb-2">Distribuciones</h3>

        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="Ministerio"
            value={ministeryId}
            onChange={(e) => setMinisteryId(e.target.value)}
            className="border rounded-md p-2 flex-1"
          />
          <input
            type="number"
            placeholder="%"
            value={percent}
            onChange={(e) => setPercent(e.target.value)}
            className="border rounded-md p-2 w-20"
          />
          <button
            type="button"
            onClick={handleAddDistribution}
            className="bg-gray-600 text-white px-3 py-2 rounded-md"
          >
            +
          </button>
        </div>

        {distributions.length > 0 && (
          <ul className="text-sm space-y-1">
            {distributions.map((d, i) => (
              <li key={i} className="flex justify-between items-center">
                <span>
                  {d.ministeryId} — {d.percent}%
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveDistribution(i)}
                  className="text-red-500 text-xs"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Botón agregar gasto */}
      <button
        type="button"
        onClick={handleAddGasto}
        className="bg-gray-600 text-white px-4 py-2 rounded-md"
      >
        Agregar gasto
      </button>

      {/* Lista de gastos */}
      {gastos.length > 0 && (
        <div className="mt-4 border p-2 rounded">
          <h3 className="font-semibold mb-2">Gastos agregados:</h3>
          <ul className="list-disc pl-5 text-sm space-y-1">
            {gastos.map((g, i) => (
              <li key={i}>
                {g.amount.toLocaleString("es-CL", {
                  style: "currency",
                  currency: "CLP",
                })}{" "}
                —{" "}
                {g.distribution
                  .map((d) => `${d.ministeryId} (${d.percent}%)`)
                  .join(", ")}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Enviar */}
      <button
        type="submit"
        disabled={loading}
        className="bg-indigo-600 text-white px-4 py-2 rounded-md"
      >
        {loading ? "Guardando..." : "Crear evento"}
      </button>

      {result && (
        <pre className="bg-gray-50 p-2 mt-4 text-sm rounded">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </form>
  );
}

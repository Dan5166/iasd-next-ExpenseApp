"use client";

import { useState } from "react";
import {
  ActionResult,
  createGasto,
  GastoData,
} from "@/actions/gasto/createGasto";
import { uploadBoleta } from "@/actions/gasto/uploadBoleta";

interface DistributionInput {
  ministeryId: string;
  percent: number;
  approvedByDirector: boolean;
}

export default function NuevoGastoForm({ eventoId }: { eventoId?: string }) {
  const [amount, setAmount] = useState<string>("");
  const [distributions, setDistributions] = useState<DistributionInput[]>([]);
  const [ministeryId, setMinisteryId] = useState("");
  const [percent, setPercent] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ActionResult<GastoData> | null>(null);

  // Estado para la boleta
  const [receiptUrl, setReceiptUrl] = useState<string | undefined>(undefined);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  // 👇 añadir distribución
  const handleAddDistribution = () => {
    const percentNum = Number(percent);
    if (!ministeryId || percentNum <= 0) return;

    setDistributions((prev) => [
      ...prev,
      {
        ministeryId,
        percent: percentNum,
        approvedByDirector: false,
      },
    ]);

    setMinisteryId("");
    setPercent("");
  };

  const handleRemoveDistribution = (index: number) => {
    setDistributions((prev) => prev.filter((_, i) => i !== index));
  };

  // 👇 subir boleta
  const handleBoletaChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingReceipt(true);
    const res = await uploadBoleta(file);
    setUploadingReceipt(false);

    if (res.success) {
      setReceiptUrl(res.url);
    } else {
      alert("Error subiendo boleta: " + res.error);
    }
  };

  // 👇 enviar gasto único a Firestore
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amountNum = Number(amount);
    if (amountNum <= 0) return alert("El monto debe ser mayor a 0");
    if (distributions.length === 0)
      return alert("Agrega al menos una distribución");

    setLoading(true);

    const res = await createGasto({
      amount: amountNum,
      status: "draft",
      eventId: eventoId ?? null,
      description: "",
      distribution: distributions,
      receiptUrl: receiptUrl,
    });

    setLoading(false);
    setResult(res);

    // Reiniciar formulario
    if (res.success) {
      setAmount("");
      setDistributions([]);
      setReceiptUrl(undefined);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
      {/* Monto */}
      <div>
        <label className="block mb-1 font-medium">Monto del gasto</label>
        <input
          type="number"
          placeholder="Ej: 50000"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border rounded-md w-full p-2"
        />
      </div>

      {/* Boleta */}
      <div>
        <label className="block mb-1 font-medium">Boleta (PDF o imagen)</label>
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={handleBoletaChange}
          className="border rounded-md w-full p-2"
        />
        {uploadingReceipt && (
          <p className="text-sm text-gray-500">Subiendo...</p>
        )}
        {receiptUrl && (
          <a
            href={receiptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 text-sm underline"
          >
            Ver boleta subida
          </a>
        )}
      </div>

      {/* Distribución */}
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

      {/* Guardar */}
      <button
        type="submit"
        disabled={loading}
        className="bg-indigo-600 text-white px-4 py-2 rounded-md w-full"
      >
        {loading ? "Guardando..." : "Guardar gasto"}
      </button>

      {result && (
        <pre className="bg-gray-50 p-2 mt-4 text-sm rounded">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </form>
  );
}

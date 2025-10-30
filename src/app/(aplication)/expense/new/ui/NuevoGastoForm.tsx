"use client";

import { useState } from "react";
import { createEventoGasto } from "@/actions";
import { uploadBoleta } from "@/actions/gasto/uploadBoleta";
import { Gasto } from "@/interfaces";
import clsx from "clsx";

interface DistributionInput {
  ministeryId: string;
  percent: number;
  approvedByDirector: boolean;
}

export default function NuevoEventoGastoForm() {
  const [eventName, setEventName] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [distributions, setDistributions] = useState<DistributionInput[]>([]);
  const [ministeryId, setMinisteryId] = useState("");
  const [percent, setPercent] = useState<string>("");
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  // Estado para la boleta
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptUrl, setReceiptUrl] = useState<string | undefined>(undefined);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

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

  const handleBoletaChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingReceipt(true);
    const res = await uploadBoleta(file);
    setUploadingReceipt(false);

    if (res.success) {
      setReceiptFile(file);
      setReceiptUrl(res.url);
    } else {
      alert("Error subiendo boleta: " + res.error);
    }
  };

  const handleAddGasto = () => {
    const amountNum = Number(amount);
    if (amountNum <= 0 || distributions.length === 0) return;

    const newGasto: Gasto = {
      status: "draft",
      amount: amountNum,
      distribution: distributions,
      receiptUrl: receiptUrl ?? undefined, // 🔥 añadimos la URL de la boleta
    };

    setGastos((prev) => [...prev, newGasto]);
    setAmount("");
    setDistributions([]);
    setReceiptFile(null);
    setReceiptUrl(undefined);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (gastos.length === 0) return alert("Agrega al menos un gasto");
    if (eventName === "") return alert("Agrega un nombre para el evento");

    setLoading(true);

    const res = await createEventoGasto(gastos, eventName, "draft");

    setResult(res);
    setGastos([]);
    setLoading(false);
    setEventName("");
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
      <label className="block mb-1 font-medium">Nombre del evento</label>
      <input
        type="text"
        placeholder="Ej: Retiro de Jovenes"
        value={eventName}
        onChange={(e) => setEventName(e.target.value)}
        className="border rounded-md w-full p-2"
      />
      {/* Monto del gasto */}
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
        className="bg-gray-600 text-white px-4 py-2 rounded-md disabled:bg-gray-400 disabled:cursor-not-allowed"
        disabled={
          distributions.length === 0 || Number(amount) <= 0 || amount === ""
        }
      >
        Agregar gasto
      </button>

      {/* Lista de gastos */}
      <div className="mt-4 border p-2 rounded">
        <h3
          className={clsx("font-semibold mb-2", {
            "text-red-600": !(gastos.length > 0),
          })}
        >
          {gastos.length > 0
            ? "Gastos agregados:"
            : "⚠ No hay gastos agregados"}
        </h3>
        {gastos.length > 0 && (
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
                {g.receiptUrl && (
                  <>
                    {" "}
                    —{" "}
                    <a
                      href={g.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      Ver boleta
                    </a>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Enviar */}
      {eventName !== "" && gastos.length > 0 && (
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md"
        >
          {loading ? "Guardando..." : "Crear evento"}
        </button>
      )}

      {result && (
        <pre className="bg-gray-50 p-2 mt-4 text-sm rounded">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </form>
  );
}

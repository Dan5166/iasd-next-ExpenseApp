// app/admin/gastos/page.tsx
import { fetchEventos } from "@/actions";
import clsx from "clsx";
import { format } from "date-fns";
import Link from "next/link";
import {
  IoCheckmarkCircleOutline,
  IoCloseCircleOutline,
  IoDocumentOutline,
  IoKeyOutline,
} from "react-icons/io5";

export default async function Page() {
  const res = await fetchEventos();

  if (!res.success) {
    return (
      <div className="p-8 text-red-600">
        Error cargando eventos: {res.error}
      </div>
    );
  }

  const eventos = res.data;

  if (eventos) console.log({ eventos });

  if (!eventos) return null;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-gray-800">Eventos de Gasto</h1>
        <Link
          href="expense/new"
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-sm"
        >
          + Nuevo evento
        </Link>
      </div>

      {eventos.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center text-gray-500">
          No hay eventos registrados.
        </div>
      ) : (
        <div className="space-y-6">
          {eventos.map((evento: any) => (
            <div
              key={evento.id}
              className="bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden"
            >
              {/* Header del evento */}
              <div className="px-6 py-4 bg-gray-50 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {evento.eventName || "Evento sin nombre"}
                  </h2>
                  <p className="text-sm text-gray-500">
                    Creado:{" "}
                    {format(new Date(evento.createdAt), "dd/MM/yyyy HH:mm")}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 text-sm font-medium rounded-full ${
                    evento.status === "approved"
                      ? "bg-green-100 text-green-700"
                      : evento.status === "draft"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {evento.status}
                </span>
              </div>

              {/* Lista de gastos */}
              <div className="divide-y divide-gray-100">
                {evento.gastos.map((gasto: any, i: number) => (
                  <div
                    key={i}
                    className={clsx(
                      "px-6 py-4 flex justify-between items-start",
                      {
                        "bg-red-100": !gasto.receiptUrl,
                      }
                    )}
                  >
                    <div className="w-full flex flex-col gap-4">
                      <div className="flex justify-between">
                        <p className="text-lg font-semibold text-gray-800">
                          {gasto.amount.toLocaleString("es-CL", {
                            style: "currency",
                            currency: "CLP",
                          })}
                        </p>
                        <div className="flex gap-8 items-center">
                          <div className="flex gap-4">
                            {/* Ver boleta */}
                            {gasto.receiptUrl && (
                              <a
                                className="text-gray-600 hover:text-blue-600 transition-colors"
                                title="Ver boleta"
                                target="_blank"
                                href={gasto.receiptUrl}
                              >
                                <IoDocumentOutline size={22} />
                              </a>
                            )}
                            {!gasto.receiptUrl && (
                              <button
                                className="text-red-600 hover:red-blue-700 transition-colors"
                                title="No hay boleta subida"
                              >
                                <IoDocumentOutline size={22} />
                              </button>
                            )}
                            {gasto.amount > 150000 && (
                              <Link
                                className="text-gray-600 hover:text-blue-600 transition-colors"
                                title="Ver aprobacion del pastor"
                                href="/pastor-aprove-[id]"
                              >
                                <IoKeyOutline size={22} />
                              </Link>
                            )}
                          </div>

                          <div className="flex gap-2">
                            {/* Aprobar */}
                            <button
                              className="text-gray-600 hover:text-green-600 transition-colors"
                              title="Aprobar"
                            >
                              <IoCheckmarkCircleOutline size={22} />
                            </button>

                            {/* Rechazar */}
                            <button
                              className="text-gray-600 hover:text-red-600 transition-colors"
                              title="Rechazar"
                            >
                              <IoCloseCircleOutline size={22} />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="mt-1 flex flex-wrap gap-2">
                        {gasto.distribution?.map((d: any, j: number) => (
                          <span
                            key={j}
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              d.approvedByDirector
                                ? "bg-green-100 text-green-700"
                                : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {d.ministeryId} •{" "}
                            {d.approvedByDirector ? "Aprobado" : "Pendiente"}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

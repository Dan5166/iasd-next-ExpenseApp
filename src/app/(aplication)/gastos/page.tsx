import { fetchAllGastos } from "@/actions/gasto/fetchAllGastos";
// En GastosPage.js

export const dynamic = "force-dynamic"; // 👈 Añade esta línea

export default async function GastosPage() {
  const res = await fetchAllGastos();

  if (!res.success) {
    return (
      <div className="p-8 text-red-600">Error cargando gastos: {res.error}</div>
    );
  }

  const gastos = res.data;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold mb-4">Lista de gastos</h1>

      {gastos.length === 0 ? (
        <p className="text-gray-500">No hay gastos registrados</p>
      ) : (
        <div className="border rounded-md divide-y bg-white shadow-sm">
          {gastos.map((g) => (
            <div
              key={g.id}
              className="p-4 flex justify-between items-center hover:bg-gray-50 transition"
            >
              <div>
                <p className="font-medium">
                  {g.amount.toLocaleString("es-CL", {
                    style: "currency",
                    currency: "CLP",
                  })}
                </p>
                <p className="text-sm text-gray-600">
                  {g.description || "Sin descripción"}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {g.createdAt
                    ? new Date(g.createdAt).toLocaleString("es-CL")
                    : "Fecha desconocida"}
                </p>
              </div>

              <div className="text-right">
                <p
                  className={`text-xs font-semibold uppercase ${
                    g.status === "approved"
                      ? "text-green-600"
                      : g.status === "draft"
                      ? "text-gray-500"
                      : "text-yellow-600"
                  }`}
                >
                  {g.status}
                </p>
                {g.eventId ? (
                  <p className="text-xs text-indigo-600 mt-1">
                    Evento: {g.eventId}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 mt-1">Sin asignar</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
